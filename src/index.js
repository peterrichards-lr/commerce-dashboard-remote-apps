import React from 'react';
import { createRoot } from 'react-dom/client';

import RecentInvoices from './components/recent-invoices/RecentInvoices';
import RecentOrders from './components/recent-orders/RecentOrders';
import RecentShipments from './components/recent-shipments/RecentShipments';

import './common/styles/index.scss';

class RecentInvoicesWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = createRoot(this);
  }

  static get observedAttributes() {
    return ['accountId', 'maxentries', 'filterbyaccount'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.debug(`The attribute ${name} was updated.`);
    switch (name) {
      case 'accountId':
      case 'maxentries':
      case 'filterbyaccount':
        if (!newValue || newValue === oldValue) return;
        this.render();
        return;
      default:
        return;
    }
  }

  render() {
    this.root.render(
      <RecentInvoices
        accountId={this.getAttribute('accountId')}
        maxEntries={this.getAttribute('maxentries')}
        filterByAccount={this.getAttribute('filterbyaccount')}
      />
    );
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

class RecentOrdersWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = createRoot(this);
  }

  static get observedAttributes() {
    return ['channelId', 'accountId', 'maxentries'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.debug(`The attribute ${name} was updated.`);
    switch (name) {
      case 'channelId':
      case 'accountId':
      case 'maxentries':
        if (!newValue || newValue === oldValue) return;
        this.render();
        return;
      default:
        return;
    }
  }

  render() {
    this.root.render(
      <RecentOrders
        channelId={this.getAttribute('channelId')}
        accountId={this.getAttribute('accountId')}
        maxEntries={this.getAttribute('maxentries')}
      />
    );
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

class RecentShipmentWebComponent extends HTMLElement {
  constructor() {
    super();
    this.root = createRoot(this);
  }

  render() {
    const config = this.parentElement.getElementsByTagName('config')[0];
    this.root.render(<RecentShipments configElement={config} />);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

const RECENT_INVOICES_ELEMENT_ID = 'recent-invoices';
const RECENT_ORDERS_ELEMENT_ID = 'recent-orders';
const RECENT_SHIPMENT_ELEMENT_ID = 'recent-shipments';

if (!customElements.get(RECENT_INVOICES_ELEMENT_ID)) {
  customElements.define(RECENT_INVOICES_ELEMENT_ID, RecentInvoicesWebComponent);
}

if (!customElements.get(RECENT_ORDERS_ELEMENT_ID)) {
  customElements.define(RECENT_ORDERS_ELEMENT_ID, RecentOrdersWebComponent);
}

if (!customElements.get(RECENT_SHIPMENT_ELEMENT_ID)) {
  customElements.define(RECENT_SHIPMENT_ELEMENT_ID, RecentShipmentWebComponent);
}
