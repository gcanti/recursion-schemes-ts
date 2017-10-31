import { Fix, fix } from '../src'
import { Functor } from 'fp-ts/lib/Functor'

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Nat: NatF<A>
  }
}

export const URI = 'Nat'

export type URI = typeof URI

export class Zero<A> {
  static value = new Zero<any>()
  readonly _tag: 'Zero' = 'Zero'
  readonly _A: A
  readonly _URI: URI
  private constructor() {}
  map<B>(f: (a: A) => B): NatF<B> {
    return this as any
  }
}

export class Succ<A> {
  readonly _tag: 'Succ' = 'Succ'
  readonly _A: A
  readonly _URI: URI
  constructor(public value: A) {}
  map<B>(f: (a: A) => B): NatF<B> {
    return new Succ(f(this.value))
  }
}

export type NatF<A> = Zero<A> | Succ<A>

export type Nat = Fix<URI>

export const zero = fix(Zero.value)

export function succ(n: Nat): Nat {
  return fix(new Succ(n))
}

export const functorNat: Functor<URI> = {
  URI,
  map<A, B>(f: (a: A) => B, nat: NatF<A>): NatF<B> {
    return nat.map(f)
  }
}
