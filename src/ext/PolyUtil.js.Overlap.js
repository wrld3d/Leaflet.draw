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
			var p = map.latLngToLayerPoint(latlngStart);
			var p1 = map.latLngToLayerPoint(latlngEnd);

			for (var f in map._layers) {
				var feature = map._layers[f];
				if (feature instanceof L.Polygon) {
					if (ignoredPolys && ignoredPolys.includes(feature)) {
						continue;
					}

					if(feature._lineSegmentIntersects(p, p1)) {
						return true;
					}
				}
			}
		}

		return false;
	}
});
