module webglext {


    export interface CacheHelper<V> {
        create( key : string ) : V;
        dispose( value : V, key : string );
    }


    class CacheEntry<V> {
        value : V;
        touched : boolean = false;

        constructor( value : V ) {
            this.value = value;
        }
    }


    export class Cache<V> {
        private helper : CacheHelper<V>;
        private map : { [ k : string ] : CacheEntry<V>; };

        constructor( helper : CacheHelper<V> ) {
            this.helper = helper;
            this.map = { };
        }

        value( key : string ) : V {
            if ( !this.map.hasOwnProperty( key ) ) {
                this.map[ key ] = new CacheEntry<V>( this.helper.create( key ) );
            }
            var en = this.map[ key ];

            en.touched = true;
            return en.value;
        }

        clear( ) {
            for ( var k in this.map ) {
                if ( this.map.hasOwnProperty( k ) ) {
                    this.helper.dispose( this.map[ k ].value, k );
                }
            }
            this.map = { };
        }

        remove( key : string ) {
            if ( this.map.hasOwnProperty( key ) ) {
                this.helper.dispose( this.map[ key ].value, key );
                delete this.map[ key ];
            }
        }

        removeAll( keys : string[] ) {
            for ( var i = 0; i < keys.length; i++ ) {
                this.remove( keys[ i ] );
            }
        }

        retain( key : string ) {
            var newMap : { [ k : string ] : CacheEntry<V>; } = { };
            if ( this.map.hasOwnProperty( key ) ) {
                newMap[ key ] = this.map[ key ];
                delete this.map[ key ];
            }
            for ( var k in this.map ) {
                if ( this.map.hasOwnProperty( k ) ) {
                    this.helper.dispose( this.map[ k ].value, k );
                }
            }
            this.map = newMap;
        }

        retainAll( keys : string[] ) {
            var newMap : { [ key : string ] : CacheEntry<V>; } = { };
            for ( var i = 0; i < keys.length; i++ ) {
                var k = keys[ i ];
                if ( this.map.hasOwnProperty( k ) ) {
                    newMap[ k ] = this.map[ k ];
                    delete this.map[ k ];
                }
            }
            for ( var k2 in this.map ) {
                if ( this.map.hasOwnProperty( k2 ) ) {
                    this.helper.dispose( this.map[ k2 ].value, k2 );
                }
            }
            this.map = newMap;
        }

        resetTouches( ) {
            for ( var k in this.map ) {
                if ( this.map.hasOwnProperty( k ) ) {
                    this.map[ k ].touched = false;
                }
            }
        }

        retainTouched( ) {
            var newMap : { [ k : string ] : CacheEntry<V>; } = { };
            for ( var k in this.map ) {
                if ( this.map.hasOwnProperty( k ) ) {
                    var en = this.map[ k ];
                    if ( en.touched ) {
                        newMap[ k ] = this.map[ k ];
                    }
                    else {
                        this.helper.dispose( en.value, k );
                    }
                }
            }
            this.map = newMap;
        }
    }


}