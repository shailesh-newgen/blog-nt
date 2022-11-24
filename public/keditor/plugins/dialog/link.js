/*
 * keditor.js
 * Copyright Kothing
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';

export default {
    name: 'link',
    add: function (core) {
        core.addModule([dialog]);

        const context = core.context;
        context.link = {
            focusElement: null,
            linkNewWindowCheck: null,
            linkAnchorText: null,
            _linkAnchor: null
        };

        /** link dialog */
        let link_dialog = this.setDialog.call(core);
        context.link.modal = link_dialog;
        context.link.focusElement = link_dialog.querySelector('._se_link_url');
        context.link.linkAnchorText = link_dialog.querySelector('._se_link_text');
        context.link.linkNewWindowCheck = link_dialog.querySelector('._se_link_check');

        /** link button */
        let link_button = this.setController_LinkButton.call(core);
        context.link.linkBtn = link_button;
        context.link._linkAnchor = null;
        link_button.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        link_dialog.querySelector('.ke-btn-primary').addEventListener('click', this.submit.bind(core));
        link_button.addEventListener('click', this.onClick_linkBtn.bind(core));

        /** append html */
        context.dialog.modal.appendChild(link_dialog);
        context.element.relative.appendChild(link_button);

        /** empty memory */
        link_dialog = null, link_button = null;
    },

    /** dialog */
    setDialog: function () {
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'ke-dialog-content';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
            '<form class="editor_link">' +
            '   <div class="ke-dialog-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '           <i aria-hidden="true" data-command="close" class="ke-icon-cancel"></i>' +
            '       </button>' +
            '       <span class="ke-modal-title">' + lang.dialogBox.linkBox.title + '</span>' +
            '   </div>' +
            '   <div class="ke-dialog-body">' +
            '       <div class="ke-dialog-form">' +
            '           <label>' + lang.dialogBox.linkBox.url + '</label>' +
            '           <input class="ke-input-form _se_link_url" type="text" />' +
            '       </div>' +
            '       <div class="ke-dialog-form">' +
            '           <label>' + lang.dialogBox.linkBox.text + '</label><input class="ke-input-form _se_link_text" type="text" />' +
            '       </div>' +
            '       <div class="ke-dialog-form-footer">' +
            '           <label><input type="checkbox" class="ke-dialog-btn-check _se_link_check" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
            '       </div>' +
            '   </div>' +
            '   <div class="ke-dialog-footer">' +
            '       <button type="button" data-command="close" class="ke-btn-cancel" aria-label="Close" title="' + lang.dialogBox.close + '"><span data-command="close">' + lang.dialogBox.close + '</span></button>' +
            '       <button type="submit" class="ke-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    /** modify controller button */
    setController_LinkButton: function () {
        const lang = this.lang;
        const link_btn = this.util.createElement('DIV');

        link_btn.className = 'ke-controller ke-controller-link';
        link_btn.innerHTML = '' +
            '<div class="ke-arrow ke-arrow-up"></div>' +
            '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>' +
            '   <div class="ke-btn-group">' +
            '       <button type="button" data-command="update" tabindex="-1" class="ke-tooltip">' +
            '           <i class="ke-icon-edit"></i>' +
            '           <span class="ke-tooltip-inner"><span class="ke-tooltip-text">' + lang.controller.edit + '</span></span>' +
            '       </button>' +
            '       <button type="button" data-command="delete" tabindex="-1" class="ke-tooltip">' +
            '           <i class="ke-icon-delete"></i>' +
            '           <span class="ke-tooltip-inner"><span class="ke-tooltip-text">' + lang.controller.remove + '</span></span>' +
            '       </button>' +
            '   </div>' +
            '</div>';

        return link_btn;
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        const submitAction = function () {
            if (this.context.link.focusElement.value.trim().length === 0) return false;

            const contextLink = this.context.link;
            const url = contextLink.focusElement.value;
            const anchor = contextLink.linkAnchorText;
            const anchorText = anchor.value.length === 0 ? url : anchor.value;

            if (!this.context.dialog.updateModal) {
                const oA = this.util.createElement('A');
                oA.href = url;
                oA.textContent = anchorText;
                oA.target = (contextLink.linkNewWindowCheck.checked ? '_blank' : '');

                this.insertNode(oA);
                this.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
            } else {
                contextLink._linkAnchor.href = url;
                contextLink._linkAnchor.textContent = anchorText;
                contextLink._linkAnchor.target = (contextLink.linkNewWindowCheck.checked ? '_blank' : '');
                // history stack
                this.history.push();
                // set range
                this.setRange(contextLink._linkAnchor.childNodes[0], 0, contextLink._linkAnchor.childNodes[0], contextLink._linkAnchor.textContent.length);
            }

            contextLink.focusElement.value = '';
            contextLink.linkAnchorText.value = '';
        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.close.call(this);
            this.closeLoading();
            this.focus();
        }

        return false;
    },

    on: function (update) {
        if (!update) {
            this.context.link.linkAnchorText.value = this.getSelection().toString();
        }
    },

    call_controller_linkButton: function (selectionATag) {
        this.editLink = this.context.link._linkAnchor = selectionATag;
        const linkBtn = this.context.link.linkBtn;
        const link = linkBtn.querySelector('a');

        link.href = selectionATag.href;
        link.title = selectionATag.textContent;
        link.textContent = selectionATag.textContent;

        const offset = this.util.getOffset(selectionATag, this.context.element.wysiwygFrame);
        linkBtn.style.top = (offset.top + selectionATag.offsetHeight + 10) + 'px';
        linkBtn.style.left = (offset.left - this.context.element.wysiwygFrame.scrollLeft) + 'px';

        linkBtn.style.display = 'block';

        const overLeft = this.context.element.wysiwygFrame.offsetWidth - (linkBtn.offsetLeft + linkBtn.offsetWidth);
        if (overLeft < 0) {
            linkBtn.style.left = (linkBtn.offsetLeft + overLeft) + 'px';
            linkBtn.firstElementChild.style.left = (20 - overLeft) + 'px';
        } else {
            linkBtn.firstElementChild.style.left = '20px';
        }
        
        this.controllersOn(linkBtn);
    },

    onClick_linkBtn: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.context.link.focusElement.value = this.context.link._linkAnchor.href;
            this.context.link.linkAnchorText.value = this.context.link._linkAnchor.textContent;
            this.context.link.linkNewWindowCheck.checked = (/_blank/i.test(this.context.link._linkAnchor.target) ? true : false);
            this.plugins.dialog.open.call(this, 'link', true);
        }
        else {
            /** delete */
            this.util.removeItem(this.context.link._linkAnchor);
            this.context.link._linkAnchor = null;
            this.focus();
        }

        this.controllersOff();
        
        // history stack
        this.history.push();
    },

    init: function () {
        const contextLink = this.context.link;
        contextLink.linkBtn.style.display = 'none';
        contextLink._linkAnchor = null;
        contextLink.focusElement.value = '';
        contextLink.linkAnchorText.value = '';
        contextLink.linkNewWindowCheck.checked = false;
    }
};
