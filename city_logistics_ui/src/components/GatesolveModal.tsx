import React from 'react';
import {Address, Location} from "util_components/types";
import Modal from "util_components/bootstrap/Modal";
import {getBoundsOfDistance, getDistance} from "geolib";
import {UserInputCoordinates} from "geolib/es/types";
// @ts-ignore
import OverpassFrontend from 'overpass-frontend';

function gatesolveUrl(origin: Location, destination: Location) {
  return `https://app.gatesolve.com/route/${origin.lat},${origin.lon}/${destination.lat},${destination.lon}/`;
}

type GatesolveModalProps = {
  destination: Address,
  onClose: () => any
}

type GatesolveModalState = {
  origin?: Location
}

const initialState: GatesolveModalState = {};

export default class GatesolveModal extends React.Component<GatesolveModalProps, GatesolveModalState> {
  state = initialState;

  render() {
    const {destination, onClose} = this.props;
    const {origin} = this.state;
    return <Modal title={`Gatesolve: ${destination.street_address}`} onClose={onClose}>
      <div style={{height: 'calc(100vh - 200px)', position: 'relative'}} className="overflow-hidden">
        {origin &&
          <iframe style={{height: 'calc(100% + 18vh)', marginTop: '-18vh', width: '100%', border: 'none'}}
                  src={gatesolveUrl(origin, destination)}/>
        }
      </div>
    </Modal>;
  }

  componentDidMount() {
    this.findOrigin();
  }

  findOrigin() {
    const {destination} = this.props;
    const bounds = getBoundsOfDistance(destination as UserInputCoordinates, 100);
    const overpassBounds = {
      minlat: bounds[0].latitude, maxlat: bounds[1].latitude,
      minlon: bounds[0].longitude, maxlon: bounds[1].longitude};

    const query = `way[name="${destination.street}"]`;
    const overpassFrontend = new OverpassFrontend('//overpass-api.de/api/interpreter');
    let nodes: Location[] = [];

    overpassFrontend.BBoxQuery(query, overpassBounds, {properties: OverpassFrontend.GEOM},
      (err: any, response: any) => {
        if (err) console.error(err);
        nodes = nodes.concat(response.data.geometry);
      },
      (err: any) => {
        let min = 10000, origin: Location = destination;
        nodes.forEach(node => {
          const distance = getDistance(node, destination);
          if (distance < min) {
            origin = node;
            min = distance;
          }
        });
        this.setState({origin});
      }
    );
  }
}
