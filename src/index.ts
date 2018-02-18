import { HKT, URIS, URIS2, URIS3, Type, Type2, Type3 } from 'fp-ts/lib/HKT'
import { Functor, Functor1, Functor2, Functor3 } from 'fp-ts/lib/Functor'
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
export function cata<F extends URIS3>(
  F: Functor3<F>
): <U, L, A>(algebra: (fa: Type3<F, U, L, A>) => A) => (term: Fix<F>) => A
export function cata<F extends URIS2>(F: Functor2<F>): <L, A>(algebra: (fa: Type2<F, L, A>) => A) => (term: Fix<F>) => A
export function cata<F extends URIS>(F: Functor1<F>): <A>(algebra: (fa: Type<F, A>) => A) => (term: Fix<F>) => A
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A {
  // optimization as described in https://japgolly.blogspot.it/2017/12/practical-awesome-recursion-ch-02.html
  return <A>(algebra: Algebra<F, A>) =>
    function self(term): A {
      return algebra(F.map(unfix(term), self))
    }
}

export type Coalgebra<F, A> = (a: A) => HKT<F, A>

/** anamorphism - builds up a structure level by level */
export function ana<F extends URIS3>(
  F: Functor3<F>
): <U, L, A>(coalgebra: (a: A) => Type3<F, U, L, A>) => (a: A) => Fix<F>
export function ana<F extends URIS2>(F: Functor2<F>): <L, A>(coalgebra: (a: A) => Type2<F, L, A>) => (a: A) => Fix<F>
export function ana<F extends URIS>(F: Functor1<F>): <A>(coalgebra: (a: A) => Type<F, A>) => (a: A) => Fix<F>
export function ana<F>(F: Functor<F>): <A>(coalgebra: Coalgebra<F, A>) => (a: A) => Fix<F>
export function ana<F>(F: Functor<F>): <A>(coalgebra: Coalgebra<F, A>) => (a: A) => Fix<F> {
  return coalgebra => compose((fa: HKT<F, Fix<F>>) => fix(fa), x => F.map(x, ana(F)(coalgebra)), coalgebra)
}

export function hylo<F extends URIS3>(
  F: Functor3<F>
): <U, L, A, B>(algebra: (fa: Type3<F, U, L, B>) => B, coalgebra: (a: A) => Type3<F, U, L, A>) => (a: A) => B
export function hylo<F extends URIS2>(
  F: Functor2<F>
): <L, A, B>(algebra: (fa: Type2<F, L, B>) => B, coalgebra: (a: A) => Type2<F, L, A>) => (a: A) => B
export function hylo<F extends URIS>(
  F: Functor1<F>
): <A, B>(algebra: (fa: Type<F, B>) => B, coalgebra: (a: A) => Type<F, A>) => (a: A) => B
export function hylo<F>(F: Functor<F>): <A, B>(algebra: Algebra<F, B>, coalgebra: Coalgebra<F, A>) => (a: A) => B
export function hylo<F>(F: Functor<F>): <A, B>(algebra: Algebra<F, B>, coalgebra: Coalgebra<F, A>) => (a: A) => B {
  return (algebra, coalgebra) => compose(algebra, x => F.map(x, hylo(F)(algebra, coalgebra)), coalgebra)
}

export type RAlgebra<F, A> = (t: HKT<F, [Fix<F>, A]>) => A

/** paramorphism - tears down a structure with primitive recursion */
export function para<F extends URIS3>(
  F: Functor3<F>
): <U, L, A>(ralgebra: (t: Type3<F, U, L, [Fix<F>, A]>) => A) => (term: Fix<F>) => A
export function para<F extends URIS2>(
  F: Functor2<F>
): <L, A>(ralgebra: (t: Type2<F, L, [Fix<F>, A]>) => A) => (term: Fix<F>) => A
export function para<F extends URIS>(
  F: Functor1<F>
): <A>(ralgebra: (t: Type<F, [Fix<F>, A]>) => A) => (term: Fix<F>) => A
export function para<F>(F: Functor<F>): <A>(ralgebra: RAlgebra<F, A>) => (term: Fix<F>) => A
export function para<F>(F: Functor<F>): <A>(ralgebra: RAlgebra<F, A>) => (term: Fix<F>) => A {
  return <A>(ralgebra: RAlgebra<F, A>) => {
    function fanout(term: Fix<F>): [Fix<F>, A] {
      return [term, para(F)(ralgebra)(term)]
    }
    return compose((x: HKT<F, [Fix<F>, A]>) => ralgebra(x), x => F.map(x, fanout), unfix)
  }
}
