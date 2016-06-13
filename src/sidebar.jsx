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

    closeSidebar: function () {
        this.setState({position: null});
    },

    render: function () {
        var info;
        if (this.state.position) {
            info = (
                <Sidebar
                    close={this.closeSidebar}
                    map={this.map}>
                        <h1>test</h1>
                        <p>{this.state.position}</p>
                    </Sidebar>
            );
        }
        return (
            <div className="map">
                <Sidebar
                    visible={!!this.state.position}
                    close={this.closeSidebar}
                    map={this.map}>
                    <h1>test</h1>
                    <p>{this.state.position}</p>
                </Sidebar>
            </div>
        );
    }
});

var Sidebar = React.createClass({

        componentWillLeave: function (callback) {
        console.log("leave?")
        callback();
    },

    render: function () {
        var sidebar;
        if (this.props.visible) {
            sidebar = (
                <SidebarContent
                    key="sidebar"
                    map={this.props.map}
                    close={this.props.close}>
                    {this.props.children}
                </SidebarContent>
            );
        }
        return (
            <ReactCSSTransitionGroup
                transitionName="sidebar"
                transitionAppear={true}
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

var SidebarContent2 = React.createClass({
    render: function () {
        return (
            <div className="sidebar" onClick={this.props.close}>content</div>
        );
    }
});


var SidebarContent = React.createClass({

    componentWillMount: function () {
        this._queries = _.map(media, function (query) {
            return matchMedia(query);
        });

        _.each(this._queries, function (q) {
            q.addListener(this.handleResize);
        }, this);
    },

    componentDidMount: function () {
        this.panMapIn();
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

    componentDidUpdate: function () {
        if (this.state.visible) {
            this.panMapIn();
        }
    },

    componentWillUnmount: function (){
        _.each(this._queries, function (q) {
            q.removeListener(this.handleResize);
        }, this);
        this.panMapOut();
    },




    panMapIn: function () {
        var node = ReactDOM.findDOMNode(this);
        if (!node) {
            return;
        }
        var offset = node.offsetWidth;
        
        this.props.map.panBy([-offset / 2, 0], {
            duration: 0.5
        });

        var controls = document.getElementsByClassName('leaflet-left');
        _.each(controls, function (control) {
            control.style.marginLeft = node.offsetWidth + 'px';
        });
    },

    panMapOut: function () {
        var node = ReactDOM.findDOMNode(this);
        var offset = node.offsetWidth;
        this.props.map.panBy([offset / 2, 0], {
            duration: 0.5
        });
        var controls = document.getElementsByClassName('leaflet-left');
        _.each(controls, function (control) {
            control.style.marginLeft = '0px';
        });
    },

    close: function () {
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
        return (

                <div
                    key="sidebar"
                    className={'sidebar sidebar-' + this.state.size}>
                    
                        <div
                            onClick={this.close}
                            className="sidebar-container">
                            {this.props.children}
                        </div>
                    
                </div>

        );
    }
});


ReactDOM.render(<Map />, document.getElementById('container'));
