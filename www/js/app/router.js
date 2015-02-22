define([
    'jquery',
    'backbone',
    'core/utils/pageslider',
    'app/views/Layout',
    'app/views/Home',
    'app/views/NextPage',
], function ($, Backbone, PageSlider, LayoutView, HomeView, NextPageView) {
    'use strict';

    var slider = new PageSlider($('body'));

    var layout = new LayoutView();
    var homeView = new HomeView();
    var nextPageView = new NextPageView();

    return Backbone.Router.extend({

        routes: {
            '': 'home',
            'nextPage': 'nextPage',
        },

        loadPage: function(view) {
            layout.setContentView(view);
            slider.slidePage(layout.render().$el);
        },

        home: function () {
            homeView.delegateEvents();
            layout.setOptions({
                title: 'Accueil',
            });
            this.loadPage(homeView);
        },

        nextPage: function () {
            nextPageView.delegateEvents();
            layout.setOptions({
                title: 'NextPage',
            });
            this.loadPage(nextPageView);
        },

    });

});
