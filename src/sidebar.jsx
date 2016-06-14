'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var matchMedia = require('matchmedia');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
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
        return {position: 1};
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

    closeSidebar: function () {
        this.setState({position: null});
    },

    render: function () {
        return (
            <div className="map">
                <Sidebar
                    autoPan={true}
                    visible={!!this.state.position}
                    close={this.closeSidebar}
                    position={'right'}
                    initialTransition={true}
                    map={this.map}>
                    <h1>test</h1>
                    <p>{this.state.position}</p>
                </Sidebar>
            </div>
        );
    }
});

var Sidebar = React.createClass({

    getDefaultProps: function () {
        return {
            initialTransition: false
        };
    },

    render: function () {
        var sidebar;
        if (this.props.visible) {
            sidebar = (
                <SidebarContent
                    key="sidebar"
                    {...this.props} >
                    {this.props.children}
                </SidebarContent>
            );
        }
        return (
            <ReactCSSTransitionGroup
                transitionName="sidebar"
                transitionAppear={this.props.initialTransition}
                transitionAppearTimeout={500}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}>
                {sidebar}
            </ReactCSSTransitionGroup>
        );
    }
});


var media = {
    large: '(min-width: 1224px)',
    medium: '(max-width: 1224px) and (min-width: 992px)',
    small: '(max-width: 992px) and (min-width: 768px)',
    fullscreen: '(max-width: 768px)'
};

var SidebarContent = React.createClass({

    getDefaultProps: function () {
        return {
            autoPan: true,
            closeButton: true,
            position: 'left'
        };
    },

    componentWillMount: function () {
        this._queries = _.map(media, function (query) {
            return matchMedia(query);
        });

        _.each(this._queries, function (q) {
            q.addListener(this.handleResize);
        }, this);
    },

    componentDidMount: function () {
        console.log(this.props);
        //stop propagation of events to map
        var node = ReactDOM.findDOMNode(this);
        var stop = L.DomEvent.stopPropagation;
        var fakeStop = L.DomEvent._fakeStop || stop;
        L.DomEvent
            .on(node, 'contextmenu', stop)
            .on(node, 'click', fakeStop)
            .on(node, 'mousedown', stop)
            .on(node, 'touchstart', stop)
            .on(node, 'dblclick', fakeStop)
            .on(node, 'mousewheel', stop)
            .on(node, 'MozMousePixelScroll', stop);

        this.panMapIn();
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

    getOffset: function () {
        var node = ReactDOM.findDOMNode(this);
        if (this.props.position === 'right') {
            return -node.offsetWidth;
        }
        return node.offsetWidth;
    },

    panMapIn: function (node) {

        //pan the map to take the sidebar into account
        if (this.props.autoPan && this.props.map) {
            this.props.map.panBy([-this.getOffset() / 2, 0], {
                duration: 0.5
            });
        }

        var node = ReactDOM.findDOMNode(this);
        //move the controls
        var controls = document.getElementsByClassName('leaflet-' + this.props.position);
        _.each(controls, function (control) {
            control.style.marginLeft = node.offsetWidth + 'px';
        });
    },

    panMapOut: function () {
        //pan the map back
        if (this.props.autoPan && this.props.map) {
            this.props.map.panBy([this.getOffset() / 2, 0], {
                duration: 0.5
            });
        }

        //move the controls back
        var controls = document.getElementsByClassName('leaflet-' + this.props.position);
        _.each(controls, function (control) {
            control.style.marginLeft = '0px';
        });
    },

    close: function () {
        this.panMapOut();
        this.props.close();
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
        var closeBtn;
        if (this.props.closeButton) {
            closeBtn = (<a className="close" onClick={this.close}>&times;</a>);
        }
        return (
            <div key="sidebar"
                 className={'leaflet-sidebar leaflet-sidebar-' + this.props.position + ' sidebar-' + this.state.size}>
                <div className="sidebar-container">
                    {closeBtn}
                    {this.props.children}
                </div>
            </div>
        );
    }
});


ReactDOM.render(<Map />, document.getElementById('container'));
