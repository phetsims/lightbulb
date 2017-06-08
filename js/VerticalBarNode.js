// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @constructor
   */
  function VerticalBarNode( property, options ) {
    options = _.extend( {
      fill: 'blue',
      stroke: 'black',
      lineWidth: 0,
      label: null, // Optional label which
      width: 30
    }, options );

    var self = this;
    this.property = property;

    Node.call( this );

    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );

    this.addChild( this.rectangleNode );
    property.link( function( value ) {
      self.rectangleNode.rectHeight = value;
      self.rectangleNode.rectY = -value;
    } );
  }

  griddle.register( 'VerticalBarNode', VerticalBarNode );

  return inherit( Node, VerticalBarNode );
} );