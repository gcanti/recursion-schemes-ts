import { Fix, fix } from '../src'
import { Functor } from 'fp-ts/lib/Functor'

export const URI = 'Expr'

export type URI = typeof URI

export class Const<A> {
  readonly _tag: 'Const' = 'Const'
  readonly _A: A
  readonly _URI: URI
  constructor(public value: number) {}
  map<B>(f: (a: A) => B): ExprF<B> {
    return this as any
  }
}

export class Add<A> {
  readonly _tag: 'Add' = 'Add'
  readonly _A: A
  readonly _URI: URI
  constructor(public x: A, public y: A) {}
  map<B>(f: (a: A) => B): ExprF<B> {
    return new Add(f(this.x), f(this.y))
  }
}

export class Mul<A> {
  readonly _tag: 'Mul' = 'Mul'
  readonly _A: A
  readonly _URI: URI
  constructor(public x: A, public y: A) {}
  map<B>(f: (a: A) => B): ExprF<B> {
    return new Mul(f(this.x), f(this.y))
  }
}

export function const_(n: number): Expr {
  return fix<URI>(new Const(n))
}

export function add(x: Expr, y: Expr): Expr {
  return fix(new Add(x, y))
}

export function mul(x: Expr, y: Expr): Expr {
  return fix(new Mul(x, y))
}

export type ExprF<A> = Const<A> | Add<A> | Mul<A>

export type Expr = Fix<URI>

export const functorExpr: Functor<URI> = {
  URI,
  map<A, B>(f: (a: A) => B, expr: ExprF<A>): ExprF<B> {
    return expr.map(f)
  }
}
