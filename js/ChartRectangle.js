// Copyright 2020, University of Colorado Boulder

import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import griddle from './griddle.js';

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

class ChartRectangle extends Rectangle {
  constructor( chartModel, options ) {
    super( 0, 0, chartModel.width, chartModel.height, options );
  }
}

griddle.register( 'ChartRectangle', ChartRectangle );
export default ChartRectangle;