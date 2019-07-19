/**
 * @class L.PolyUtil
 * @aka Util
 * @aka L.Utils
 */
L.Util.extend(L.PolyUtil, {

	// @method lineOverlapsPolygons(map, latlngStart, latlngEnd, ignoredPolys): boolean
	// Checks to see if a line overlaps any polygons
	lineOverlapsPolygons: function (map, latlngStart, latlngEnd, ignoredPolys) {
		if (map) {
			var start = L.LatLngUtil.cloneLatLngWithoutAlt(latlngStart);
			var end = L.LatLngUtil.cloneLatLngWithoutAlt(latlngEnd);
			const p = map.latLngToLayerPoint(start);
			const p1 = map.latLngToLayerPoint(end);
			const bounds = [start, end];

			for (var f in map._layers) {
				const feature = map._layers[f];
				if (feature instanceof L.Polygon) {
					if (ignoredPolys && ignoredPolys.includes(feature)) {
						continue;
					}

					if (feature.getBounds().intersects(bounds) && feature._lineSegmentIntersects(p, p1)) {
						return true;
					}
				}
			}
		}

		return false;
	},
	
	// @method pointOverlapsPolygons: function (map, latlng, ignoredPolys): boolean
	// Checks to see if a point is inside another polygon
	pointOverlapsPolygons: function (map, latlng, ignoredPolys) {
		if (map) {
			var latlngWithoutAlt = L.LatLngUtil.cloneLatLngWithoutAlt(latlng);
			const p = map.latLngToLayerPoint(latlngWithoutAlt);
			const bounds = [latlngWithoutAlt, latlngWithoutAlt];

			for (var f in map._layers) {
				const feature = map._layers[f];
				if (feature instanceof L.Polygon) {
					if (ignoredPolys && ignoredPolys.includes(feature)) {
						continue;
					}

					if (feature.getBounds().intersects(bounds) && feature._pointInside(p)) {
						return true;
					}
				}
			}
		}

		return false;
	},

	// @method checkPolygonOverlapsOthers(map, poly): boolean
	// Checks to see if poylgon overlaps another polygon
	checkPolygonOverlapsOthers: function (map, poly) {
		if (map) {
			const bounds = poly.getBounds();

			for (var f in map._layers) {
				const feature = map._layers[f];
				if (feature instanceof L.Polygon && feature != poly && feature.getBounds().intersects(bounds)) {
					const points = feature._getProjectedPoints();
					for (var i = 0; i < points.length; i++) {
						if (poly._pointInside(points[i])) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}
});
