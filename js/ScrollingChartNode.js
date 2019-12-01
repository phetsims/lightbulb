// Copyright 2018-2019, University of Colorado Boulder

/**
 * A scrolling graph component.  Like a seismograph, it has pens on the right hand side that record data, and the paper
 * scrolls to the left.  It is currently sized accordingly to be used in a small draggable sensor, like the ones in Wave
 * Interference, Bending Light or Circuit Construction Kit: AC. It would typically be embedded in a Panel.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * Moved from wave-interference repo to griddle repo on Wed, Aug 29, 2018.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const DynamicSeriesNode = require( 'GRIDDLE/DynamicSeriesNode' );
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const SpanNode = require( 'GRIDDLE/SpanNode' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const LABEL_GRAPH_MARGIN = 3;
  const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
  const VERTICAL_AXIS_LABEL_MARGIN = 4;

  class ScrollingChartNode extends Node {

    /**
     * @param {NumberProperty} timeProperty - indicates the passage of time in the model in the same units as the model.
     *                                      - This may be seconds or another unit depending on the model.
     * @param {DynamicSeries[]} dynamicSeriesArray - data to be plotted. The client is responsible for pruning data as
     *                                             - it leaves the visible window.
     * @param {Object} [options]
     */
    constructor( timeProperty, dynamicSeriesArray, options ) {
      super();

      options = merge( {
        width: 190,  // dimensions
        height: 140, // dimensions
        numberHorizontalLines: 3, // Number of horizontal lines (not counting top and bottom)
        numberVerticalLines: 4, // Determines the time between vertical gridlines
        rightGraphMargin: 10, // There is a blank space on the right side of the graph so there is room for the pens
        cornerRadius: 5,
        seriesLineWidth: 2,
        topMargin: 10,
        numberVerticalDashes: 12,
        rightMargin: 10,

        // default options for the Rectangle on top (to make sure graph lines don't protrude)
        graphPanelOverlayOptions: {
          stroke: 'black',
          pickable: false
        },
        graphPanelOptions: null, // filled in below because some defaults are based on other options
        gridLineOptions: null, // filled in below because some defaults are based on other options

        // Labels (required) // TODO: Use required pattern
        verticalAxisLabelNode: null,
        horizontalAxisLabelNode: null,
        spanLabelNode: null,

        showVerticalGridLabels: true
      }, options );

      // Promote to local variables for readability
      const { width, height, numberHorizontalLines, numberVerticalLines } = options;

      // default options to be passed into the graphPanel Rectangle
      options.graphPanelOptions = merge( {
        fill: 'white',

        // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
        stroke: 'black',
        right: width - options.rightMargin,
        top: options.topMargin,
        pickable: false
      }, options.graphPanelOptions );

      // default options for the horizontal and vertical grid lines
      const dashLength = height / options.numberVerticalDashes / 2;
      options.gridLineOptions = merge( {
        stroke: 'lightGray',
        lineDash: [ dashLength + 0.6, dashLength - 0.6 ],
        lineWidth: 0.8,
        lineDashOffset: dashLength / 2
      }, options.gridLineOptions );

      // White panel with gridlines that shows the data
      options.graphPanelOptions = merge( {

        // Prevent data from being plotted outside the graph
        clipArea: Shape.rect( 0, 0, width, height )
      }, options.graphPanelOptions );
      const graphPanel = new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius,
        options.graphPanelOptions
      );

      // Map from data coordinates to chart coordinates. Note that the "x" axis is the "time" axis in most or all cases
      const modelViewTransform = new ModelViewTransform2();
      timeProperty.link( time => {
        modelViewTransform.setToRectangleMapping(
          new Bounds2( time - 4, -1, time, +1 ),
          new Bounds2( 0, 0, width - options.rightGraphMargin, height )
        );
      } );

      // Horizontal lines indicate increasing vertical value
      const horizontalLabelMargin = -3;
      for ( let i = 0; i <= numberHorizontalLines + 1; i++ ) {
        const y = height * i / ( numberHorizontalLines + 1 );
        const line = new Line( 0, y, width, y, options.gridLineOptions );
        if ( i !== 0 && i !== numberHorizontalLines + 1 ) {
          graphPanel.addChild( line );
        }

        const b = graphPanel.localToParentBounds( line.bounds );
        const yValue = modelViewTransform.viewToModelY( y );
        if ( options.showVerticalGridLabels ) {
          this.addChild( new Text( yValue, {
            fill: 'white',
            rightCenter: b.leftCenter.plusXY( horizontalLabelMargin, 0 )
          } ) );
        }
      }

      const plotWidth = width - options.rightGraphMargin;

      // Vertical lines
      for ( let i = 1; i <= numberVerticalLines; i++ ) {
        const x = plotWidth * i / numberVerticalLines;
        graphPanel.addChild( new Line( x, 0, x, height, options.gridLineOptions ) );
      }

      this.addChild( graphPanel );

      // @private - for disposal
      this.scrollingChartNodeDisposeEmitter = new Emitter();

      /**
       * Creates and adds a dynamicSeries with the given color
       * @param {DynamicSeries} dynamicSeries - see constructor docs
       */
      const addDynamicSeries = dynamicSeries => {
        const dynamicSeriesNode = new DynamicSeriesNode(
          dynamicSeries,
          plotWidth,
          graphPanel.bounds,
          numberVerticalLines,
          timeProperty,
          modelViewTransform
        );
        graphPanel.addChild( dynamicSeriesNode );
        this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
      };

      dynamicSeriesArray.forEach( addDynamicSeries );

      // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke.
      // This is a faster alternative to clipping.
      graphPanel.addChild( new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius, options.graphPanelOverlayOptions ) );

      /* -------------------------------------------
       * Optional decorations
       * -------------------------------------------*/

      // Position the vertical axis title node
      options.verticalAxisLabelNode.mutate( {
        maxHeight: graphPanel.height,
        right: this.bounds.minX - VERTICAL_AXIS_LABEL_MARGIN, // whether or not there are vertical axis labels, position to the left
        centerY: graphPanel.centerY
      } );
      this.addChild( options.verticalAxisLabelNode );

      const spanNode = new SpanNode( options.spanLabelNode, plotWidth / 4, {
        left: graphPanel.left,
        top: graphPanel.bottom + 2
      } );

      this.addChild( spanNode );
      this.addChild( options.horizontalAxisLabelNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      options.horizontalAxisLabelNode.maxWidth = graphPanel.right - spanNode.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

      // Position the horizontal axis title node after its maxWidth is specified
      options.horizontalAxisLabelNode.mutate( {
        top: graphPanel.bottom + LABEL_GRAPH_MARGIN,
        centerX: plotWidth / 2 + graphPanel.bounds.minX
      } );
      if ( options.horizontalAxisLabelNode.left < spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
        options.horizontalAxisLabelNode.left = spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
      }

      this.mutate( options );
    }

    /**
     * Releases resources when no longer used.
     * @public
     */
    dispose() {
      this.scrollingChartNodeDisposeEmitter.emit();
      this.scrollingChartNodeDisposeEmitter.dispose();
      super.dispose();
    }
  }

  return griddle.register( 'ScrollingChartNode', ScrollingChartNode );
} );