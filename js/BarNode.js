// Copyright 2017-2019, University of Colorado Boulder

/**
 * Represents a bar in a bar chart for a specific set of composite values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const griddle = require( 'GRIDDLE/griddle' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Utils = require( 'DOT/Utils' );

  /**
   * @constructor
   *
   * NOTE: This is provided in the "mathematical" coordinate frame, where +y is up. For visual handling, rotate it by
   * Math.PI.
   *
   * NOTE: update() should be called between when the bars change and a Display.updateDisplay(). This node does not
   * otherwise update its view.
   *
   * @param {Array.<Object>} barEntries - Objects of the type {
   *                                        property: {Property.<number>},
   *                                        color: {paint},
   *
   *                                        // Optional, modify the bar height in a custom way, called before the height
   *                                        // is constrained to the totalRangeProperty so bar will still
   *                                        // be within range
   *                                        // @optional
   *                                        // @param {number} value - value of this Bar Property
   *                                        // @param {number} scale - value of the scale Property
   *                                        // @returns {number}
   *                                        modifyBarHeight: function( value, scale ) {
   *                                          return value * height;
   *                                        }
   *                                      }
   * @param {Property.<Range>} totalRangeProperty - Range of visual values displayed (note negative values for min are
   *                           supported).
   * @param {Object} [options]
   */
  function BarNode( barEntries, totalRangeProperty, options ) {
    assert && assert( barEntries.length > 0 );

    options = merge( {
      // {paint} - The color of the border (along the sides and top of the bar)
      borderColor: 'black',

      // {number} - Width of the border (along the sides and top of the bar)
      borderWidth: 1,

      // {number} - The visual width of the bar (excluding the stroke)
      barWidth: 15,

      // {boolean} - Whether off-scale arrows should be shown
      showOffScaleArrow: true,

      // {paint} - Fill for the off-scale arrows
      offScaleArrowFill: '#bbb',

      // {number} - Distance between the top of a bar and the bottom of the off-scale arrow
      offScaleArrowOffset: 5,

      // {paint} - If any of the bar properties are negative (and this is non-null) and we have multiple bars, this
      // color will be used instead.
      invalidBarColor: 'gray',

      // {Property.<number>} - If provided, the given entries' values will be scaled by this number before display.
      scaleProperty: new NumberProperty( 1 )
    }, options );

    // @private {Array.<BarProperty>}
    this.barEntries = barEntries;

    // @private {Property.<Range>}
    this.totalRangeProperty = totalRangeProperty;

    // @private
    this.borderWidth = options.borderWidth;
    this.scaleProperty = options.scaleProperty;
    this.showOffScaleArrow = options.showOffScaleArrow;
    this.offScaleArrowOffset = options.offScaleArrowOffset;
    this.invalidBarColor = options.invalidBarColor;

    // @private {Array.<Rectangle>}
    this.bars = this.barEntries.map( function( barEntry ) {
      return new Rectangle( 0, 0, options.barWidth, 0, {
        centerX: 0
      } );
    } );

    // @private {Rectangle}
    this.borderRectangle = new Rectangle( 0, 0, options.barWidth + 2 * options.borderWidth, 0, {
      fill: options.borderColor,
      centerX: 0
    } );

    // @private {ArrowNode}
    this.offScaleArrow = new ArrowNode( 0, 0, 0, options.barWidth, {
      fill: options.offScaleArrowFill,
      stroke: 'black',
      headHeight: options.barWidth / 2,
      headWidth: options.barWidth,
      tailWidth: options.barWidth * 3 / 5,
      centerX: 0
    } );

    const children = [ this.borderRectangle ].concat( this.bars );
    if ( options.showOffScaleArrow ) {
      children.push( this.offScaleArrow );
    }
    options.children = children;

    Node.call( this, options );

    this.update();
  }

  griddle.register( 'BarNode', BarNode );

  /**
   * Sets a rectangle's y and height such that it goes between the two y values given.
   *
   * @param {Rectangle} rectangle
   * @param {number} y1
   * @param {number} y2
   */
  function setBarYValues( rectangle, y1, y2 ) {
    rectangle.rectY = Math.min( y1, y2 );
    rectangle.rectHeight = Math.abs( y1 - y2 );
  }

  return inherit( Node, BarNode, {
    /**
     * Updates all of the bars to the correct values.
     * @public
     */
    update: function() {
      let i;
      const scale = this.scaleProperty.value;

      // How much of our "range" we need to take away, to be able to show an out-of-scale arrow.
      const arrowPadding = this.offScaleArrow.height + this.offScaleArrowOffset;

      // How far our actual bar rectangles can go (minimum and maximum). If our bars reach this limit (on either side),
      // an off-scale arrow will be shown.
      let effectiveRange = this.totalRangeProperty.value;

      // Reduce the effective range to compensate with the borderWidth, so we don't overshoot the range.
      effectiveRange = new Range( effectiveRange.min < 0 ? effectiveRange.min + this.borderWidth : effectiveRange.min, effectiveRange.max - this.borderWidth );
      if ( this.showOffScaleArrow ) {
        effectiveRange = new Range( effectiveRange.min < 0 ? effectiveRange.min + arrowPadding : effectiveRange.min,
          effectiveRange.max - arrowPadding );
      }

      // Total (scaled) sum of values for all bars
      let total = 0;

      // Whether we have any negative-value bars
      let hasNegative = false;

      // Check for whether we have an "invalid bar" case with the total and hasNegative
      for ( i = 0; i < this.barEntries.length; i++ ) {
        const value = this.barEntries[ i ].property.value * scale;
        if ( value < 0 ) {
          hasNegative = true;
        }
        total += value;
      }

      // Start with the first bar at the origin.
      let currentY = 0;

      // Composite bars are represented by one bar with multiple entries stacked on top of each other.
      // If a composite bar contains an entry with a negative value, only the first entry is used to display the effective
      // range and the remaining entries are hidden. Also the color of the composite bar is updated.
      if ( hasNegative && this.barEntries.length > 1 ) {

        // optionally further modify the bar height
        const barEntry = this.barEntries[ 0 ];
        if ( barEntry.modifyBarHeight ) {
          currentY = barEntry.modifyBarHeight( barEntry.property.value, scale );
        }

        // Use only the first entry to display the effective range
        currentY = effectiveRange.constrainValue( total );
        const firstBar = this.bars[ 0 ];

        // Change the color of the displayed bar.
        firstBar.fill = this.invalidBarColor;
        setBarYValues( firstBar, 0, currentY );
        firstBar.visible = true;

        // Hide the other bars
        for ( i = 1; i < this.barEntries.length; i++ ) {
          this.bars[ i ].visible = false;
        }
      }
      else {
        for ( i = 0; i < this.barEntries.length; i++ ) {
          const barEntry = this.barEntries[ i ];
          const bar = this.bars[ i ];
          bar.fill = barEntry.color;
          let barValue = barEntry.property.value * scale;

          // optionally further modify the bar height
          if ( barEntry.modifyBarHeight ) {
            barValue = barEntry.modifyBarHeight( barEntry.property.value, scale );
          }

          // The bar would be displayed between currentY and nextY
          const nextY = effectiveRange.constrainValue( currentY + barValue );

          // Set the bar to the next stacked position
          if ( nextY !== currentY ) {
            setBarYValues( bar, currentY, nextY );
            bar.visible = true;
          }

          // Quell bars that are extremely small.
          else {
            bar.visible = false;
          }
          currentY = nextY;
        }
      }

      // Off-scale arrow visible on the top (max)
      if ( currentY === effectiveRange.max ) {
        this.offScaleArrow.visible = true;
        this.offScaleArrow.rotation = 0;
        this.offScaleArrow.y = effectiveRange.max + this.offScaleArrowOffset; // mathematical top
      }
      // Off-scale arrow visible on the bottom (min)
      else if ( currentY === effectiveRange.min && currentY < 0 ) {
        this.offScaleArrow.visible = true;
        this.offScaleArrow.rotation = Math.PI;
        this.offScaleArrow.y = effectiveRange.min - this.offScaleArrowOffset; // mathematical bottom
      }
      // No off-scale arrow visible
      else {
        this.offScaleArrow.visible = false;
      }

      setBarYValues( this.borderRectangle, 0, currentY + this.borderWidth * Utils.sign( currentY ) );
      this.borderRectangle.visible = currentY !== 0;
    }
  } );
} );
