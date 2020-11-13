// Copyright 2018-2020, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import sceneryPhetQueryParameters from '../../../scenery-phet/js/sceneryPhetQueryParameters.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import ABSwitch from '../../../sun/js/ABSwitch.js';
import BooleanRectangularStickyToggleButton from '../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import BooleanRectangularToggleButton from '../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import DemosScreenView from '../../../sun/js/demo/DemosScreenView.js';
import HSlider from '../../../sun/js/HSlider.js';
import NumberSpinner from '../../../sun/js/NumberSpinner.js';
import Panel from '../../../sun/js/Panel.js';
import VSlider from '../../../sun/js/VSlider.js';
import AxisNode from '../bamboo/AxisNode.js';
import GridLineSet from '../bamboo/GridLineSet.js';
import BarChartNode from '../BarChartNode.js';
import ChartModel from '../bamboo/ChartModel.js';
import ChartRectangle from '../bamboo/ChartRectangle.js';
import DynamicSeries from '../DynamicSeries.js';
import DynamicSeriesNode from '../DynamicSeriesNode.js';
import griddle from '../griddle.js';
import GridNode from '../GridNode.js';
import ScatterPlot from '../bamboo/ScatterPlot.js';
import TickMarkNode from '../bamboo/TickMarkNode.js';
import XYChartNode from '../XYChartNode.js';
import SeismographNode from '../SeismographNode.js';
import XYCursorChartNode from '../XYCursorChartNode.js';

// constants - this is a hack to enable components to animate from the animation loop
const emitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

class GriddleDemoScreenView extends DemosScreenView {
  constructor() {

    super( [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} createNode - creates the scene graph for the demo
       */
      { label: 'ChartNode', createNode: demoChartNode },
      { label: 'BarChart', createNode: demoBarChart },
      { label: 'GridNode', createNode: demoGridNode },
      { label: 'XYChartNode', createNode: demoScrollingChartNode },
      { label: 'SeismographNode', createNode: demoSeismographNode },
      { label: 'XYCursorChartNode', createNode: demoXYCursorPlot }
    ], {
      selectedDemoLabel: sceneryPhetQueryParameters.component
    } );
  }

  /**
   * Move the model forward in time.
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step( dt ) {
    emitter.emit( dt );
  }
}

const demoChartNode = function( layoutBounds ) {

  const chartNode = new Node();
  const width = 400;
  const height = 400;
  const chartModel = new ChartModel( {
    width: width,
    height: height,
    modelViewTransform: ModelViewTransform2.createRectangleMapping( new Bounds2( -1, -1, 1, 1 ), new Bounds2( 0, 0, width, height ) )
  } );

  const data = [];
  for ( let i = -1; i < 1; i += 0.01 ) {
    phet.joist.random.nextDouble() < 0.3 && data.push( new Vector2( i, Math.sin( i * 2 ) ) );
  }
  const chartRectangle = new ChartRectangle( chartModel, {
    fill: 'yellow',
    stroke: 'black',
    cornerXRadius: 6,
    cornerYRadius: 6
  } );
  chartNode.addChild( chartRectangle );

  // Anything you want clipped goes in here
  const chartClip = new Node( { clipArea: chartRectangle.getShape() } );
  chartNode.addChild( chartClip );
  chartClip.addChild( new ScatterPlot( chartModel, data ) );

  // Minor grid lines
  chartClip.addChild( new GridLineSet( chartModel, Orientation.VERTICAL, 0.1, { stroke: 'lightGray' } ) );
  chartClip.addChild( new GridLineSet( chartModel, Orientation.HORIZONTAL, 0.1, { stroke: 'lightGray' } ) );

  // Major grid lines
  chartClip.addChild( new GridLineSet( chartModel, Orientation.VERTICAL, 0.2, { stroke: 'darkGray' } ) );
  chartClip.addChild( new GridLineSet( chartModel, Orientation.HORIZONTAL, 0.2, { stroke: 'darkGray' } ) );

  chartNode.addChild( new AxisNode( chartModel, Orientation.VERTICAL, {} ) );

  // Tick marks on the axis
  for ( let i = -1; i <= 1; i += 0.3 ) {
    const tickMarkNode = new TickMarkNode( chartModel, i, 0, Orientation.VERTICAL, {
      extent: 8
    } );
    chartNode.addChild( tickMarkNode );
    const label = new Text( i.toFixed( 1 ), {
      fontSize: 14
    } );
    chartModel.modelViewTransformProperty.link( m => label.setCenterTop( tickMarkNode.centerBottom ) );
    chartNode.addChild( label );
  }
  chartNode.addChild( new AxisNode( chartModel, Orientation.HORIZONTAL, {} ) );
  for ( let i = -1; i <= 1; i += 0.3 ) {
    const tickMarkNode = new TickMarkNode( chartModel, 0, i, Orientation.HORIZONTAL, {
      extent: 8
    } );
    chartNode.addChild( tickMarkNode );
    const label = new Text( i.toFixed( 1 ), {
      fontSize: 14
    } );

    // TODO: observe the tick mark node itself?
    chartModel.modelViewTransformProperty.link( m => label.setRightCenter( tickMarkNode.leftCenter ) );
    chartNode.addChild( label );
  }

  const centerXProperty = new NumberProperty( 0 );
  centerXProperty.link( centerX => {
    chartModel.modelViewTransformProperty.value = ModelViewTransform2.createRectangleMapping( new Bounds2( -1, -1, 1, 1 ).shiftedX( -centerX / 5 ), new Bounds2( 0, 0, width, height ) );
  } );
  const controls = new HSlider( centerXProperty, new Range( -1, 1 ) );
  return new VBox( {
    resize: false,
    children: [ chartNode, controls ],
    center: layoutBounds.center
  } );
};

// Creates a demo for the BarChartNode
const demoBarChart = function( layoutBounds ) {
  const model = {
    aProperty: new Property( 0 ),
    bProperty: new Property( 0 ),
    cProperty: new Property( 0 )
  };
  const aEntry = {
    property: model.aProperty,
    color: 'red'
  };
  const bEntry = {
    property: model.bProperty,
    color: 'green'
  };
  const cEntry = {
    property: model.cProperty,
    color: 'blue'
  };

  const barChartNode = new BarChartNode( [
    { entries: [ aEntry ], label: new Node() },
    { entries: [ bEntry ], label: new Node() },
    { entries: [ cEntry ], label: new Node() },
    { entries: [ cEntry, bEntry, aEntry ], label: new Node() }
  ], new Property( new Range( -100, 200 ) ), {
    barOptions: {
      totalRange: new Range( -100, 200 )
    }
  } );
  const listener = function( dt ) {
    barChartNode.update();
  };
  emitter.addListener( listener );
  const sliderRange = new Range( -200, 300 );
  const sliderOptions = {
    trackSize: new Dimension2( 5, 200 )
  };
  const hBox = new HBox( {
    align: 'top',
    spacing: 60,
    center: layoutBounds.center,
    children: [
      new Node( {
        children: [ barChartNode ]
      } ),
      new HBox( {
        spacing: 25,
        children: [
          new VSlider( model.aProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: aEntry.color } ) ),
          new VSlider( model.bProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: bEntry.color } ) ),
          new VSlider( model.cProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: cEntry.color } ) )
        ]
      } )
    ]
  } );

  // Swap out the dispose function for one that also removes the Emitter listener
  const hboxDispose = hBox.dispose.bind( hBox );
  hBox.dispose = function() {
    emitter.removeListener( listener );
    hboxDispose();
  };
  return hBox;
};

// Creates a demo for GridNode
const demoGridNode = layoutBounds => {
  const gridWidth = 400;
  const gridHeight = 400;
  const minorSpacingRange = new Range( 1, 2 );
  const majorSpacingRange = new Range( 4, 10 );
  const defaultMinorSpacing = minorSpacingRange.min;
  const defaultMajorSpacing = majorSpacingRange.min;
  const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping(
    new Bounds2( 0, 0, 10, 10 ),
    new Bounds2( 0, 0, gridWidth, gridHeight )
  ) );

  const gridNode = new GridNode( gridWidth, gridHeight, {
    majorHorizontalLineSpacing: defaultMajorSpacing,
    majorVerticalLineSpacing: defaultMajorSpacing,
    minorHorizontalLineSpacing: defaultMinorSpacing,
    minorVerticalLineSpacing: defaultMinorSpacing,
    modelViewTransformProperty: modelViewTransformProperty,
    minorLineOptions: {
      lineDash: [ 5, 5 ]
    }
  } );

  // creates a NumberSpinner with a text label that controls grid spacing
  const createLabelledSpinner = ( labelString, numberProperty, enabledProperty, valueDelta ) => {
    const label = new Text( labelString, { font: new PhetFont( 15 ) } );
    const spinner = new NumberSpinner( numberProperty, new Property( numberProperty.range ), {
      deltaValue: valueDelta,
      enabledProperty: enabledProperty,
      numberDisplayOptions: {
        align: 'center',
        xMargin: 5,
        yMargin: 3,
        textOptions: { font: new PhetFont( 28 ) }
      }
    } );
    return new HBox( {
      children: [ label, spinner ],
      spacing: 5
    } );
  };

  // creates a BooleanRectangularToggleButton that toggles visibility of grid lines
  const createToggleLinesButton = ( visibleProperty, visibleText, hiddenText ) => {
    return new BooleanRectangularToggleButton( new Text( visibleText ), new Text( hiddenText ), visibleProperty );
  };

  // Properties for controls to change the GridNode
  const verticalLinesVisibleProperty = new BooleanProperty( true );
  const horizontalLinesVisibleProperty = new BooleanProperty( true );
  const scrollingProperty = new BooleanProperty( false );

  const minorHorizontalLineSpacingProperty = new NumberProperty( defaultMinorSpacing, { range: minorSpacingRange } );
  const minorVerticalLineSpacingProperty = new NumberProperty( defaultMinorSpacing, { range: minorSpacingRange } );
  const majorHorizontalLineSpacingProperty = new NumberProperty( defaultMajorSpacing, { range: majorSpacingRange } );
  const majorVerticalLineSpacingProperty = new NumberProperty( defaultMajorSpacing, { range: majorSpacingRange } );

  // controls to change the GridNode
  const minorHorizontalLineSpinner = createLabelledSpinner( 'Minor Horizontal Spacing', minorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 1 );
  const minorVerticalLineSpinner = createLabelledSpinner( 'Minor Vertical Spacing', minorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 1 );
  const majorHorizontalLineSpinner = createLabelledSpinner( 'Major Horizontal Spacing', majorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 2 );
  const majorVerticalLineSpinner = createLabelledSpinner( 'Major Vertical Spacing', majorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 2 );

  const hideHorizontalLinesButton = createToggleLinesButton( horizontalLinesVisibleProperty, 'Hide Horizontal', 'Show Horizontal' );
  const hideVerticalLinesButton = createToggleLinesButton( verticalLinesVisibleProperty, 'Hide Vertical', 'Show Horizontal' );

  const hideButtonsHBox = new HBox( {
    children: [ hideHorizontalLinesButton, hideVerticalLinesButton ],
    spacing: 10
  } );

  const scrollButton = new BooleanRectangularStickyToggleButton( scrollingProperty, {
    content: new Text( 'Scroll' )
  } );

  const controls = new VBox( {
    children: [ minorHorizontalLineSpinner, minorVerticalLineSpinner, majorHorizontalLineSpinner, majorVerticalLineSpinner, hideButtonsHBox, scrollButton ],
    spacing: 15,
    align: 'right'
  } );

  const node = new HBox( {
    children: [ controls, gridNode ],
    spacing: 15,
    center: layoutBounds.center,
    resize: false
  } );

  Property.multilink( [ verticalLinesVisibleProperty, horizontalLinesVisibleProperty ], ( verticalVisible, horizontalVisible ) => {
    const majorVerticalLineSpacing = verticalVisible ? majorVerticalLineSpacingProperty.get() : null;
    const minorVerticalLineSpacing = verticalVisible ? minorVerticalLineSpacingProperty.get() : null;
    const majorHorizontalLineSpacing = horizontalVisible ? majorHorizontalLineSpacingProperty.get() : null;
    const minorHorizontalLineSpacing = horizontalVisible ? minorHorizontalLineSpacingProperty.get() : null;

    gridNode.setLineSpacings( {
      majorVerticalLineSpacing: majorVerticalLineSpacing,
      majorHorizontalLineSpacing: majorHorizontalLineSpacing,
      minorVerticalLineSpacing: minorVerticalLineSpacing,
      minorHorizontalLineSpacing: minorHorizontalLineSpacing
    } );

    // disable the other button, cant have both sets hidden at once
    hideHorizontalLinesButton.enabled = verticalVisible;
    hideVerticalLinesButton.enabled = horizontalVisible;
  } );

  Property.multilink( [ majorVerticalLineSpacingProperty, majorHorizontalLineSpacingProperty, minorHorizontalLineSpacingProperty, minorVerticalLineSpacingProperty ],
    ( majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing ) => {
      gridNode.setLineSpacings( {
        majorVerticalLineSpacing: majorVerticalLineSpacing,
        majorHorizontalLineSpacing: majorHorizontalLineSpacing,
        minorVerticalLineSpacing: minorVerticalLineSpacing,
        minorHorizontalLineSpacing: minorHorizontalLineSpacing
      } );
    }
  );

  let offset = 0;
  emitter.addListener( dt => {
    if ( scrollingProperty.get() ) {
      offset -= dt;
      const offsetVector = new Vector2( offset, offset );

      modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( offsetVector.x, offsetVector.y, 10 + offsetVector.x, 10 + offsetVector.y ),
        new Bounds2( 0, 0, gridWidth, gridHeight )
      ) );
    }
  } );

  return node;
};

/**
 * Creates an example XYChartNode
 * @param layoutBounds
 */
const demoScrollingChartNode = function( layoutBounds ) {
  const timeProperty = new Property( 0 );
  const series1 = new DynamicSeries( { color: 'blue', lineWidth: 3, radius: 7 } );
  const series2 = new DynamicSeries( { color: 'orange', lineWidth: 3, radius: 7 } );
  const horizontalRange = new Range( 0, 10 );
  const verticalRange = new Range( -5, 5 );
  const maxTime = horizontalRange.max;
  const chartWidth = 500;
  const chartHeight = 500;

  const styleProperty = new Property( DynamicSeriesNode.PlotStyle.LINE );

  const labelFont = new PhetFont( { size: 25 } );
  const styleSwitch = new ABSwitch(
    styleProperty,
    DynamicSeriesNode.PlotStyle.LINE,
    new Text( 'Line', { font: labelFont } ),
    DynamicSeriesNode.PlotStyle.SCATTER,
    new Text( 'Scatter', { font: labelFont } )
  );

  const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleInvertedYMapping(
    new Bounds2( horizontalRange.min, verticalRange.min, horizontalRange.max, verticalRange.max ),
    new Bounds2( 0, 0, chartWidth, chartHeight )
  ) );

  const listener = dt => {

    // Increment the model time
    timeProperty.value += dt;

    // time has gone beyond the initial max time, so update the transform to pan data so that the new points
    // are in view
    if ( timeProperty.get() > maxTime ) {

      const minY = verticalRange.min + timeProperty.value - maxTime;
      const maxY = verticalRange.max + timeProperty.value - maxTime;
      modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
        new Bounds2( timeProperty.get() - maxTime, minY, timeProperty.get(), maxY ),
        new Bounds2( 0, 0, chartWidth, chartHeight )
      ) );
    }

    // if drawing a scatter plot, just draw a new dot every half second
    if ( styleProperty.get() === DynamicSeriesNode.PlotStyle.SCATTER && series1.hasData() ) {
      const timeDifference = timeProperty.get() - series1.getDataPoint( series1.getLength() - 1 ).x;
      if ( timeDifference < 0.5 ) {
        return;
      }
    }

    // Sample new data
    series1.addXYDataPoint( timeProperty.value, timeProperty.value + Math.sin( timeProperty.value ) + verticalRange.min );
    series2.addXYDataPoint( timeProperty.value, timeProperty.value + Math.sin( timeProperty.value + 1 ) + verticalRange.min );

    // Data that does not fall within the displayed window should be removed.
    while ( series1.getDataPoint( 0 ).x < timeProperty.value - maxTime ) {
      series1.shiftData();
      series2.shiftData();
    }
  };
  emitter.addListener( listener );
  const scrollingChartNode = new XYChartNode( {
    width: chartWidth,
    height: chartHeight,
    verticalAxisLabelNode: new Text( 'Height (m)', { fill: 'white', rotation: 3 * Math.PI / 2 } ),
    horizontalAxisLabelNode: new Text( 'time (s)', { fill: 'white' } ),
    modelViewTransformProperty: modelViewTransformProperty
  } );
  scrollingChartNode.addDynamicSeriesArray( [ series1, series2 ] );

  styleProperty.link( style => {
    scrollingChartNode.setPlotStyle( style );
    series1.clear();
    series2.clear();
  } );

  const panel = new Panel( scrollingChartNode, {
    fill: 'gray',
    resize: false
  } );

  // Swap out the dispose function for one that also removes the Emitter listener
  const panelDispose = panel.dispose.bind( panel );
  panel.dispose = () => {
    emitter.removeListener( listener );
    panelDispose();
  };

  return new VBox( {
    children: [ panel, styleSwitch ],
    spacing: 15,
    center: layoutBounds.center.plusXY( 25, 0 )
  } );
};

const demoSeismographNode = layoutBounds => {
  const timeProperty = new Property( 0 );
  const series1 = new DynamicSeries( { color: 'blue' } );
  const maxTime = 4;
  const listener = dt => {

    // Increment the model time
    timeProperty.value += dt;

    // Sample new data
    series1.addXYDataPoint( timeProperty.value, Math.sin( timeProperty.value ) );

    // Data that does not fall within the displayed window should be removed.
    while ( series1.getDataPoint( 0 ).x < timeProperty.value - maxTime ) {
      series1.shiftData();
    }
  };
  emitter.addListener( listener );
  const seismographNode = new SeismographNode( timeProperty, [ series1 ], new Text( '1 s', { fill: 'white' } ), {
    width: 200,
    height: 150,
    verticalGridLabelNumberOfDecimalPlaces: 1,
    horizontalGridLabelNumberOfDecimalPlaces: 1,
    verticalAxisLabelNode: new Text( 'Height (m)', {
      rotation: 3 * Math.PI / 2,
      fill: 'white'
    } ),
    horizontalAxisLabelNode: new Text( 'time (s)', { fill: 'white' } ),
    verticalRanges: [ new Range( -1, 1 ), new Range( -2, 2 ), new Range( -3, 3 ) ]
  } );
  const panel = new Panel( seismographNode, {
    fill: 'gray',
    center: layoutBounds.center
  } );

  // Swap out the dispose function for one that also removes the Emitter listener
  const panelDispose = panel.dispose.bind( panel );
  panel.dispose = () => {
    emitter.removeListener( listener );
    panelDispose();
  };
  return panel;
};

/**
 * Creates an example XYCursorChartNode
 * @param layoutBounds
 * @returns {XYCursorChartNode}
 */
const demoXYCursorPlot = layoutBounds => {
  const chartWidth = 800;
  const chartHeight = 200;
  const maxTime = 10;
  const chartRange = new Range( -1, 1 );

  const timeProperty = new NumberProperty( 0 );

  const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleInvertedYMapping(
    new Bounds2( 0, chartRange.min, maxTime, chartRange.max ),
    new Bounds2( 0, 0, chartWidth, chartHeight )
  ) );

  const dataSeries = new DynamicSeries();

  // while dragging,
  let dragging = false;

  const chartNode = new XYCursorChartNode( {
    width: chartWidth,
    height: chartHeight,
    modelViewTransformProperty: modelViewTransformProperty,
    maxX: maxTime,
    showAxis: false,
    minY: chartRange.min,
    maxY: chartRange.max,
    lineDash: [ 4, 4 ],

    verticalAxisLabelNode: new Text( 'Value', { rotation: 3 * Math.PI / 2, fill: 'white' } ),
    horizontalAxisLabelNode: new Text( 'Time (s)', { fill: 'white' } ),

    cursorOptions: {
      drag: () => {
        dragging = true;
      },
      endDrag: () => {
        dragging = false;
      }
    }
  } );
  chartNode.addDynamicSeries( dataSeries );

  const chartPanel = new Panel( chartNode, {
    fill: 'grey',
    center: layoutBounds.center,
    resize: false
  } );

  const listener = dt => {

    // no recording if we are dragging the cursor
    if ( !dragging ) {

      // Increment the model time
      timeProperty.set( timeProperty.get() + dt );

      // Sample new data
      dataSeries.addXYDataPoint( timeProperty.get(), Math.sin( timeProperty.get() ) );

      // time has gone beyond the initial max time, so update the transform to pan data so that the new points
      // are in view
      if ( timeProperty.get() > maxTime ) {
        modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
          new Bounds2( timeProperty.get() - maxTime, chartRange.min, timeProperty.get(), chartRange.max ),
          new Bounds2( 0, 0, chartWidth, chartHeight )
        ) );
      }

      // Data that does not fall within the displayed window should be removed.
      while ( dataSeries.getDataPoint( 0 ).x < timeProperty.value - maxTime ) {
        dataSeries.shiftData();
      }

      chartNode.setCursorValue( timeProperty.get() );
    }
  };
  emitter.addListener( listener );

  return chartPanel;
};

griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );
export default GriddleDemoScreenView;