// Copyright 2014-2015, University of Colorado Boulder

/**
 * XY Data Series
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Events = require( 'AXON/Events' );

  function XYDataSeries( options ) {

    options = _.extend( {
      color: 'black',

      // size of array to initially allocate for the series, use expected max for best performance
      initialSize: 1000
    }, options );

    this.color = options.color; // @public
    this.listeners = []; // @private

    this.xPoints = new Array( options.initialSize ); // @private
    this.yPoints = new Array( options.initialSize ); // @private

    this.dataSeriesLength = 0; // @private, index to next available slot

    Events.call( this );
  }

  return inherit( Events, XYDataSeries, {

    addDataSeriesListener: function( listener ) {
      this.listeners.push( listener );
    },

    removeDataSeriesListener: function( listener ) {
      var index = this.listeners.indexOf( listener );
      if ( index !== -1 ) {
        this.listeners.splice( index, 1 );
      }
    },

    addPoint: function( x, y ) {

      // store the data
      this.xPoints[ this.dataSeriesLength ] = x;
      this.yPoints[ this.dataSeriesLength ] = y;

      // notify listeners - note that the previous data series values can be undefined in the notification
      for ( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[ i ]( x, y, this.xPoints[ this.dataSeriesLength - 1 ], this.yPoints[ this.dataSeriesLength - 1 ] );
      }

      // point to the next slot
      this.dataSeriesLength++;
    },

    clear: function() {
      this.dataSeriesLength = 0;
      this.trigger( 'cleared' );
    },

    getX: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }
      return this.xPoints[ index ];
    },

    getY: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }
      return this.yPoints[ index ];
    },

    /**
     * @public - getter for the length.  DON'T CHANGE THIS TO AN ES5 GETTER.  That's what is was originally, and it
     * caused poor performance on iPad, see https://github.com/phetsims/neuron/issues/55.
     */
    getLength: function() {
      return this.dataSeriesLength;
    }
  } );
} );