import { HKT, HKTS, HKTAs, HKT2S, HKT2As } from 'fp-ts/lib/HKT'
import { Functor } from 'fp-ts/lib/Functor'
import { compose } from 'fp-ts/lib/function'

export class Fix<F> {
  constructor(public readonly value: HKT<F, Fix<F>>) {}
}

export function fix<F>(value: HKT<F, Fix<F>>): Fix<F> {
  return new Fix(value)
}

export function unfix<F>(term: Fix<F>): HKT<F, Fix<F>> {
  return term.value
}

export type Algebra<F, A> = (fa: HKT<F, A>) => A

/** catamorphism - tears down a structure level by level */
export function cata<F extends HKT2S>(F: Functor<F>): <L, A>(algebra: (fa: HKT2As<F, L, A>) => A) => (term: Fix<F>) => A
export function cata<F extends HKTS>(F: Functor<F>): <A>(algebra: (fa: HKTAs<F, A>) => A) => (term: Fix<F>) => A
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A {
  return algebra => compose(algebra, x => F.map(cata(F)(algebra), x), unfix)
}

export type Coalgebra<F, A> = (a: A) => HKT<F, A>

/** anamorphism - builds up a structure level by level */
export function ana<F extends HKT2S>(F: Functor<F>): <L, A>(coalgebra: (a: A) => HKT2As<F, L, A>) => (a: A) => Fix<F>
export function ana<F extends HKTS>(F: Functor<F>): <A>(coalgebra: (a: A) => HKTAs<F, A>) => (a: A) => Fix<F>
export function ana<F>(F: Functor<F>): <A>(coalgebra: Coalgebra<F, A>) => (a: A) => Fix<F>
export function ana<F>(F: Functor<F>): <A>(coalgebra: Coalgebra<F, A>) => (a: A) => Fix<F> {
  return coalgebra => compose((fa: HKT<F, Fix<F>>) => fix(fa), x => F.map(ana(F)(coalgebra), x), coalgebra)
}

export function hylo<F extends HKT2S>(
  F: Functor<F>
): <L, A, B>(algebra: (fa: HKT2As<F, L, B>) => B, coalgebra: (a: A) => HKT2As<F, L, A>) => (a: A) => B
export function hylo<F extends HKTS>(
  F: Functor<F>
): <A, B>(algebra: (fa: HKTAs<F, B>) => B, coalgebra: (a: A) => HKTAs<F, A>) => (a: A) => B
export function hylo<F>(F: Functor<F>): <A, B>(algebra: Algebra<F, B>, coalgebra: Coalgebra<F, A>) => (a: A) => B
export function hylo<F>(F: Functor<F>): <A, B>(algebra: Algebra<F, B>, coalgebra: Coalgebra<F, A>) => (a: A) => B {
  return (algebra, coalgebra) => compose(algebra, x => F.map(hylo(F)(algebra, coalgebra), x), coalgebra)
}

export type RAlgebra<F, A> = (t: HKT<F, [Fix<F>, A]>) => A

/** paramorphism - tears down a structure with primitive recursion */
export function para<F extends HKT2S>(
  F: Functor<F>
): <L, A>(ralgebra: (t: HKT2As<F, L, [Fix<F>, A]>) => A) => (term: Fix<F>) => A
export function para<F extends HKTS>(
  F: Functor<F>
): <A>(ralgebra: (t: HKTAs<F, [Fix<F>, A]>) => A) => (term: Fix<F>) => A
export function para<F>(F: Functor<F>): <A>(ralgebra: RAlgebra<F, A>) => (term: Fix<F>) => A
export function para<F>(F: Functor<F>): <A>(ralgebra: RAlgebra<F, A>) => (term: Fix<F>) => A {
  return <A>(ralgebra: RAlgebra<F, A>) => {
    function fanout(term: Fix<F>): [Fix<F>, A] {
      return [term, para(F)(ralgebra)(term)]
    }
    return compose((x: HKT<F, [Fix<F>, A]>) => ralgebra(x), x => F.map(fanout, x), unfix)
  }
}
