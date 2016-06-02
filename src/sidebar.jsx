'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var matchMedia = require('matchmedia');
var NativeListener = require('react-native-listener');
var _ = require('underscore');
var L = require('leaflet');
require('leaflet_css');

require('./sidebar.css');
require('./map.css');

function createMap(element) {
    var map = new L.Map(element);
    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
    map.addLayer(osm);
    return map;
}

var Map = React.createClass({

    getInitialState: function () {
        return {position: null};
    },

    componentDidMount: function () {
        this.map = createMap(ReactDOM.findDOMNode(this));
        this.map.setView([61, 11], 5);
        this.map.on('click', this.mapClicked, this);
    },

    mapClicked: function (e) {
        var pos = e.latlng.lat + ', ' + e.latlng.lng;
        this.setState({position: pos});
    },

    render: function () {
        var info;
        if (this.state.position) {
            info = (<Sidebar map={this.map}><h1>test</h1><p>{this.state.position}</p></Sidebar>);
        }
        return (
            <div className="map">
                {info}
            </div>
        );
    }
});


var media = {
    large: '(min-width: 1224px)',
    medium: '(max-width: 1224px) and (min-width: 992px)',
    small: '(max-width: 992px) and (min-width: 768px)',
    fullscreen: '(max-width: 768px)'
};

var Sidebar = React.createClass({

    componentWillMount: function () {
        this._queries = _.map(media, function (query) {
            return matchMedia(query);
        });

        _.each(this._queries, function (q) {
            q.addListener(this.handleResize);
        }, this);
    },

    componentDidMount: function () {
        this.panMap();
    },

    componentDidUpdate: function () {
        this.panMap();
    },

    getInitialState: function () {
        var query = _.find(media, function (query) {
            return matchMedia(query).matches;
        });
        return {
            size: this.getSizeClass(query),
            visible: true
        };
    },

    componentWillUnmount: function (){
        _.each(this._queries, function (q) {
            q.removeListener(this.handleResize);
        }, this);
    },

    panMap: function () {
        if (this.state.visible) {
            var node = ReactDOM.findDOMNode(this);
            var offset = node.offsetWidth;
            this.props.map.panBy([-offset / 2, 0], {
                duration: 0.5
            });
        } else {
            //todo: GET WIDTH to set map back
        }
    },

    close: function () {
        this.setState({visible: false});
    },

    handleResize: function (e) {
        if (e.matches) {
            var size = this.getSizeClass(e.media);
            this.setState({size: size});
        }
    },

    getSizeClass: function (query) {
        return _.invert(media)[query];
    },

    stopPropagation: function (e) {
        e.stopPropagation();
    },

    click: function (e) {
        this.close();
        e.stopPropagation();
    },

    render: function () {
        if (!this.state.visible) {
            return null;
        }
        return (
            <div
                className={'sidebar sidebar-' + this.state.size}>
                <NativeListener
                    onClick={this.click}
                    onDoubleClick={this.stopPropagation}
                    onMouseDown={this.stopPropagation}>
                    <div
                        onClick={this.close}
                        className="sidebar-container">
                        {this.props.children}
                    </div>
                </NativeListener>
            </div>
        );
    }
});


ReactDOM.render(<Map />, document.getElementById('container'));
