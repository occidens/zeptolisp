
type Nil = null;
type Atom = symbol | number | string | Nil;
type Cons = [ car: Atom, cdr: Cons | Atom ];
type Pair = readonly [ car: Atom, cdr: Atom ];
type List = readonly [ car: Atom, cdr: Cons | Nil];

class Foo implements Pair {
    get 0(){
        return 'car';
    }
    get 1() {
        return 'cdr';
    }
    get length(): 2 {
        return 2;
    }
}