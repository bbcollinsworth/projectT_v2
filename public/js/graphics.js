var viz = {

	markerOptions: {
		'suspect': {
			zIndexOffset: 1000,
			opacity: 0.8 //,
		},
		'agent': {
			opacity: 0.5 //,
		},
		mouseDownEvent: function(e) {
			e.preventDefault();
			console.log("Starting capture!");
			//newPlayer['captureCircle'] = viz.drawCaptureCircle(newPlayer.latestPos);
		}
	},

	markerIconOptions: {
		suspect: {
			'marker-size': 'large',
			'marker-symbol': 'pitch',
			'marker-color': '#ff0000'
		},
		agent: {
			'marker-size': 'large',
			'marker-symbol': 'police',
			'marker-color': '#0000ff'
		} //,
		// self: {
		// 	'marker-size': 'large',
		// 	//'marker-symbol': 'police',
		// 	'marker-color': '#ffff00'
		// }
	},

	//CREATE CUSTOM MARKER WITH ADD'L PROPERTIES + FUNCTIONS
	marker: function(type, pos, isDraggable) {

		if (isDraggable === undefined) {
			isDraggable = false;
		}

		var m = L.marker([pos.lat, pos.lng], {
			icon: L.mapbox.marker.icon(viz.markerIconOptions[type]),
			draggable: isDraggable,
			opacity: viz.markerOptions[type].opacity,
			zIndexOffset: viz.markerOptions[type].zIndexOffset || 0
		});


		var extension = {

			refresh: function(posObj, options) {
				m.setLatLng([posObj.lat, posObj.lng]);
				if (options !== undefined) {
					//m.update();
				}

				console.log("Marker refreshed to: " + posObj.lat + ", " + posObj.lng);
			},

			makePopupHTML: function() {
				var newHTML = "";
				if ('title' in m) {
					newHTML += m.title.firstCap().bold().addBreak();
				}
				if ('text' in m) {
					for (line in m.text) {
						newHTML += m.text[line].addBreak();
					}
				}
				return newHTML;
			},

			initPopup: function(data) {
				for (key in data) {
					m[key] = data[key];
				}
			},

			addPopup: function(shouldOpen) {

				var pHTML = m.makePopupHTML();
				//console.log("popup HTML is: " + pHTML);

				if ('popupClass' in m) {
					var pOptions = {
						className: m.popupClass
					};
					m.bindPopup(pHTML, pOptions);
				} else {
					m.bindPopup(pHTML);
				}

				if (shouldOpen) {
					m.openPopup();
				}
			},

			updatePopup: function(data) {
				for (key in data) {
					m[key] = data[key];
				}
				var pHTML = m.makePopupHTML();
				m.setPopupContent(pHTML);
			},

			attachCaptureEvents: function() {
				console.log("Attaching Capture Events to " + m.title);
				newPlayer['captureCircle'] = viz.drawCaptureCircle(newPlayer.latestPos);

				m.addOneTimeEventListener('mouseDown', viz.markerOptions.mouseDownEvent);
			},

			removeCaptureEvents: function() {

			}
		}

		$.extend(true, m, extension);

		return m;
	},

	captureSetup: {
		radius: 40,
		options: {
			'className': "captureCircle",
			'fillColor': '#ff0000',
			'fillOpacity': '0.5',
			'stroke': false
		}
	},

	drawCaptureCircle: function(pos) {
		var p = [pos.lat, pos.lng];
		var c = L.circleMarker(p, viz.captureSetup.options);
		c.setRadius(viz.captureSetup.radius);

		var screenOffset = map.latLngToContainerPoint(p);
		// screenOffset.x += viz.captureSetup.radius;
		// screenOffset.y += viz.captureSetup.radius;
		var rad = viz.captureSetup.radius;
		var α = 0,
			π = Math.PI,
			t = 30;

		//FUNCTION FOR PIE-TIMER
		c['draw'] = function() {
			α++;
			//α %= 360;
			var r = (α * π / 180),
				x = Math.sin(r) * rad,
				y = Math.cos(r) * -1 * rad,
				mid = (α > 180) ? 1 : 0,
				anim = 'M 0 0 v -' + rad + ' A' + rad + ' ' + rad + ' 1 ' + mid + ' 1 ' + x + ' ' + y + ' z';

			var circles = document.getElementsByClassName('captureCircle');
			var newCSS = {
				'transform': 'translate(' + screenOffset.x + ',' + screenOffset.y + ')',
				'd': anim
			};
			$.each(newCSS, function(key, value) {
				//WOULD NEED TO BE CHANGED TO DEAL WITH INDEX / ARRAY ISSUE OF CLASS
				circles[0].setAttribute(key, value);
			});

			if (α < 360) {
				setTimeout(c.draw, t); // Redraw
			}
		};

		c.addTo(map);
		c.draw();
		return c;
	},

	// ====== HUB VISUALIZATION SETUP ==============//
	hubOptions: {
		area: {
			'stroke': false
		},
		marker: {
			'weight': 3
		}

	},

	hub: function(hData) {
		var h = {
			area: L.circle([hData.lat, hData.lng], hData.hackRange, viz.hubOptions['area']),
			marker: L.circleMarker([hData.lat, hData.lng], viz.hubOptions['marker']), //this.renderMarker(this.markerRadius),
			markerRadius: 10,
			flash: function(interval) {
				//gov.flashHub(this,interv);
				if (interval === undefined) {
					interval = 1000;
				}

				var c = '#ff0000';

				h.stopFlash();
				h['flasher'] = setInterval(function() {

					h.area.setStyle({
						fillColor: c
					});

					if (c == '#ff0000') {
						c = '#0033ff';
					} else {
						c = '#ff0000';
					}
				}, interval);
			},
			stopFlash: function() {
				if (h.flasher) {
					clearInterval(h.flasher);
				}
			}
		};

		h.marker.setRadius(h.markerRadius);

		return h;
	},

	searchButton: function() {

		var eyeIcon = $("<div />", {
			'class': "ui-btn ui-corner-all ui-icon-eye ui-btn-icon-notext"

		});

		var button = $("<div />", {
			'class': "ui-btn",
			'id': "searchButton",
			'data-icon': "eye"
		});

		button.append(eyeIcon);

		return button;

	}


};