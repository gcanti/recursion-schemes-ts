import { Functor2 } from 'fp-ts/lib/Functor'

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    Tree: TreeF<L, A>
  }
}

export const URI = 'Tree'

export type URI = typeof URI

export class Empty<A, R> {
  static value = new Empty<any, any>()
  readonly _tag: 'Empty' = 'Empty'
  // prettier-ignore
  readonly '_A': R
  // prettier-ignore
  readonly '_L': A
  // prettier-ignore
  readonly '_URI': URI
  private constructor() {}
  map<B>(f: (a: R) => B): TreeF<A, B> {
    return this as any
  }
}

export class Leaf<A, R> {
  readonly _tag: 'Leaf' = 'Leaf'
  // prettier-ignore
  readonly '_A': R
  // prettier-ignore
  readonly '_L': A
  // prettier-ignore
  readonly '_URI': URI
  constructor(public value: A) {}
  map<B>(f: (a: R) => B): TreeF<A, B> {
    return this as any
  }
}

export class Node<A, R> {
  readonly _tag: 'Node' = 'Node'
  // prettier-ignore
  readonly '_A': R
  // prettier-ignore
  readonly '_L': A
  // prettier-ignore
  readonly '_URI': URI
  constructor(public left: R, readonly right: R) {}
  map<B>(f: (a: R) => B): TreeF<A, B> {
    return new Node(f(this.left), f(this.right))
  }
}

export type TreeF<A, R> = Empty<A, R> | Leaf<A, R> | Node<A, R>

export const functorTree: Functor2<URI> = {
  URI,
  map<L, A, B>(fa: TreeF<L, A>, f: (a: A) => B): TreeF<L, B> {
    return fa.map(f)
  }
}
