import React from 'react';
import Modal from "util_components/bootstrap/Modal";
// @ts-ignore
import * as L from 'leaflet';
import settings from 'settings.json';

import GlyphIcon from "util_components/GlyphIcon";
import Geolocator from "util_components/Geolocator";
import Map from "util_components/Map";
import {Location, Address} from 'util_components/types';
import GatesolveModal from "components/GatesolveModal";

export type BaseMapProps = {
  origin: Address,
  destination: Address,
  currentPosition?: Location,
  currentPositionIndex?: number,
}

export type MapProps = BaseMapProps & {
  onClose: () => any
}

type State = {
  currentPosition: null | Location,
  imageNotesLayer?: any,
  gatesolveTo?: Address
};

function googleNavUrl(destination: Location) {
  return `https://www.google.com/maps/dir/?api=1&travelmode=bicycling&destination=${destination.lat},${destination.lon}`;
}

export default class RouteMapModal extends React.Component<MapProps, State> {
  state: State = {
    currentPosition: null
  };

  private leafletMap: any = null;
  private markers: {
    origin?: any, destination?: any, currentPosition?: any
  } = {};
  private path: any = null;
  private pathLayer: any = null;
  private userMovedMap: boolean = false;

  initMapState() {
    this.leafletMap = null;
    this.markers = {};
    this.path = null;
    this.pathLayer = null;
    this.userMovedMap = false;
  }

  render() {
    const {gatesolveTo} = this.state;
    const {origin, destination, onClose, currentPositionIndex=0} = this.props;
    const currentPosition = this.getCurrentPosition();

    if (gatesolveTo) return <GatesolveModal destination={gatesolveTo} onClose={onClose}/>

    else return <Modal title={`${origin.street_address} to ${destination.street_address}`} onClose={onClose}>
      <div style={{height: 'calc(100vh - 200px)', position: 'relative'}}>
        <Map extraLayers={this.getMapLayers()}
             latLng={currentPosition ? [currentPosition.lat, currentPosition.lon] : undefined}
             onMapInitialized={this.setMap}/>
      </div>
      <div className="d-none">
        {([[origin, 'origin'], [destination, 'destination']] as [Address, string][])
         .map(([location, name]) =>
          <div id={`${name}-popup`} key={name}>
            <h6>{location.street_address}</h6>
            <div className="font-weight-bold text-center">Navigate using:</div>
            <a className="btn btn-block btn-sm" href={googleNavUrl(location)} target="google">Google</a>
            <a className="btn btn-block btn-sm" onClick={() => this.setState({gatesolveTo: location})}>Gatesolve</a>
          </div>
        )}
      </div>
      {(currentPositionIndex > -1) && !this.props.currentPosition &&
        <Geolocator onLocation={([lon, lat]) => this.setState({currentPosition: {lat, lon}})}/>
      }
    </Modal>;
  }

  setMap = (leafletMap: any) => {
    this.leafletMap = leafletMap;
    this.leafletMap.on('zoomstart', () => this.userMovedMap = true);
    this.leafletMap.on('movestart', () => this.userMovedMap = true);
  };

  componentDidMount() {
    this.refreshMap();
  }

  componentWillUnmount() {
    this.initMapState()
  }

  componentDidUpdate() {
    this.refreshMap();
  }

  getMapLayers() {
    const {origin, destination} = this.props;
    const {imageNotesLayer} = this.state;
    const currentPosition = this.getCurrentPosition();

    if (!this.pathLayer) {
      this.pathLayer = L.layerGroup();
      this.path = L.polyline([]);
      this.path.addTo(this.pathLayer);
    }
    this.path.setLatLngs(this.coords().map(({lat, lon}) => [lat, lon]));

    Object.entries({origin, destination, currentPosition}).forEach(([name, coord]) => {
      if (!coord) return;
      // @ts-ignore
      const marker = this.markers[name], glyph = settings.markerIcons[name];
      if (marker) marker.setLatLng([coord.lat, coord.lon]);
      // @ts-ignore
      else this.markers[name] = L.marker(
          [coord.lat, coord.lon],
          {icon: new GlyphIcon({glyph, glyphSize: 20})}
        ).addTo(this.pathLayer);
    });

    if (imageNotesLayer) return [imageNotesLayer, this.pathLayer];
    else return [this.pathLayer];
  }

  refreshMap() {
    if (!this.userMovedMap) this.leafletMap.fitBounds(this.bounds());
    this.markers.origin.bindPopup(document.getElementById('origin-popup'));
    this.markers.destination.bindPopup(document.getElementById('destination-popup'));
  }

  getCurrentPosition() {
    return this.props.currentPosition || this.state.currentPosition;
  }

  coords() {
    const {origin, destination} = this.props;
    const currentPositionIndex = this.props.currentPositionIndex || 0;
    const currentPosition = this.getCurrentPosition();
    const coords: Location[] = [origin, destination];

    if (currentPosition && (currentPositionIndex >= 0)) {
      coords.splice(currentPositionIndex, 0, currentPosition);
    }
    return coords;
  }

  bounds() {
    const coords = this.coords();
    const lats = coords.map((c) => c.lat);
    const lons = coords.map((c) => c.lon);
    return [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]];
  }
}
