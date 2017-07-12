import { HKT } from 'fp-ts/lib/HKT'
import { Functor } from 'fp-ts/lib/Functor'
import { compose } from 'fp-ts/lib/function'

export type Algebra<F, A> = (fa: HKT<F, A>) => A

export class Fix<F> {
  readonly _URI: 'Fix'
  constructor(public readonly value: HKT<F, Fix<F>>) {}
}

export function fix<F>(value: HKT<F, Fix<F>>): Fix<F> {
  return new Fix(value)
}

export function unFix<F>(term: Fix<F>): HKT<F, Fix<F>> {
  return term.value
}

/** catamorphism - tears down a structure level by level */
export function cata<F, A>(F: Functor<F>, algebra: Algebra<F, A>): (term: Fix<F>) => A {
  return compose(algebra, x => F.map(cata(F, algebra), x), unFix)
}

export type Coalgebra<F, A> = (a: A) => HKT<F, A>

/** anamorphism - builds up a structure level by level */
export function ana<F, A>(F: Functor<F>, coalgebra: Coalgebra<F, A>): (a: A) => Fix<F> {
  return compose((fa: HKT<F, Fix<F>>) => fix(fa), x => F.map(ana(F, coalgebra), x), coalgebra)
}

export type RAlgebra<F, A> = (t: HKT<F, [Fix<F>, A]>) => A

/** paramorphism - tears down a structure with primitive recursion */
export function para<F, A>(F: Functor<F>, ralgebra: RAlgebra<F, A>): (term: Fix<F>) => A {
  function fanout(term: Fix<F>): [Fix<F>, A] {
    return [term, para(F, ralgebra)(term)]
  }
  return compose((x: HKT<F, [Fix<F>, A]>) => ralgebra(x), x => F.map(fanout, x), unFix)
}
