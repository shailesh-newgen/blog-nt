/*
 * keditor.js
 * Copyright Kothing
 * MIT license.
 */
'use strict';

export default {
    name: 'template',
    add: function (core, targetElement) {
        const context = core.context;
        context.template = {};

        /** set submenu */
        let templateDiv = this.setSubmenu.call(core);

        /** add event listeners */
        templateDiv.querySelector('ul').addEventListener('click', this.pickup.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(templateDiv);

        /** empty memory */
        templateDiv = null;
    },

    setSubmenu: function () {
        const templateList = this.context.option.templates;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'ke-list-layer';

        let list = '<div class="ke-submenu ke-list-inner">' +
            '   <ul class="ke-list-basic">';
        for (let i = 0, len = templateList.length, t; i < len; i++) {
            t = templateList[i];
            list += '<li><button type="button" class="ke-btn-list" data-value="' + i + '" title="' + t.name + '">' + t.name + '</button></li>';
        }
        list += '   </ul>';
        list += '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup: function (e) {
        if (!/^BUTTON$/i.test(e.target.tagName)) return false;

        e.preventDefault();
        e.stopPropagation();

        const temp = this.context.option.templates[e.target.getAttribute('data-value')];

        if (temp.html) {
            this.setContents(temp.html);
        } else {
            this.submenuOff();
            throw Error('[KEDITOR.template.fail] cause : "templates[i].html not found"');
        }
        
        this.submenuOff();
    }
};