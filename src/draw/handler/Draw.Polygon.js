/**
 * @class L.Draw.Polygon
 * @aka Draw.Polygon
 * @inherits L.Draw.Polyline
 */
L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	// NOTE: wrld.js overrides L.polygon with an extended version that handles our projected transforms.
	// L.Polygon however, refers the base Leaflet Polygon type and is used internally by L.polygon.
	// This could maybe do with a rethink, but for now instantiate the extended 'shimmed' version.
	Poly: L.polygon,

	options: {
		showArea: false,
		showLength: false,
		shapeOptions: {
			stroke: true,
			color: '#3388ff',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		// Whether to use the metric measurement system (truthy) or not (falsy).
		// Also defines the units to use for the metric system as an array of
		// strings (e.g. `['ha', 'm']`).
		metric: true,
		feet: true, // When not metric, to use feet instead of yards for display.
		nautic: false, // When not metric, not feet use nautic mile for display
		// Defines the precision for each type of unit (e.g. {km: 2, ft: 0}
		precision: {}
	},

	// @method initialize(): void
	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	// @method addVertex(): void
	// Add a vertex to the end of the polyline
	addVertex: function (latlng) {

		//If we are indoors then ignore alt as we want to be at floor level
		if ("indoors" in this._map && this._map.indoors.isIndoors()) {
			latlng = L.LatLngUtil.cloneLatLngWithoutAlt(latlng);
		}

		//Check if line from previous marker intersect with any other polyline.
		if (!this._newVertexIsValid(latlng)) {
			this._showErrorTooltip(this.options.drawError.overlapmessage);
			return;
		}

		L.Draw.Polyline.prototype.addVertex.call(this, latlng);
	},

	_newVertexIsValid: function (latlng) {
		//Check if line from previous marker intersect with any other polyline.
		if (!this.options.allowOverlap) {
			if (L.PolyUtil.pointOverlapsPolygons(this._map, latlng)) {
				return false;
			}

			if (this._markers.length > 0) {
				const lastMarker = this._markers[this._markers.length - 1];
				lastMarker._latlng;

				if (L.PolyUtil.lineOverlapsPolygons(this._map, latlng, lastMarker._latlng)) {
					return false;
				}
			}
		}

		return true;
	},

	_finishShape: function () {
		if (!this._canFinishShape()) {
			this._showErrorTooltip(this.options.drawError.overlapmessage);
			return;
		}

		L.Draw.Polyline.prototype._finishShape.call(this);
	},

	_canFinishShape: function () {
		if (!this._shapeIsValid()) {
			return false;
		}

		if (!this.options.allowOverlap && L.PolyUtil.checkPolygonOverlapsOthers(this._map, this._poly)) {
			return false;
		}

		return true;
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;

		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}

		// Add and update the double click handler
		if (markerCount > 2) {
			this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
			// Only need to remove handler if has been added before
			if (markerCount > 3) {
				this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
			}
		}
	},

	_getTooltipText: function () {
		var text, subtext;

		if (this._markers.length === 0) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.start;
		} else if (this._markers.length < 3) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
			subtext = this._getMeasurementString();
		} else {
			text = L.drawLocal.draw.handlers.polygon.tooltip.end;
			subtext = this._getMeasurementString();
		}

		return {
			text: text,
			subtext: subtext
		};
	},

	_getMeasurementString: function () {
		var area = this._area,
			measurementString = '';


		if (!area && !this.options.showLength) {
			return null;
		}

		if (this.options.showLength) {
			measurementString = L.Draw.Polyline.prototype._getMeasurementString.call(this);
		}

		if (area) {
			measurementString += '<br>' + L.GeometryUtil.readableArea(area, this.options.metric, this.options.precision);
		}

		return measurementString;
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexChanged: function (latlng, added) {
		var latLngs;

		// Check to see if we should show the area
		if (!this.options.allowIntersection && this.options.showArea) {
			latLngs = this._poly.getLatLngs();

			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			this._markers[0].off('click', this._finishShape, this);

			if (markerCount > 2) {
				this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
			}
		}
	}
});
