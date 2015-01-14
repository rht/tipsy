'use strict';

import Component from '../../component';
import storage from '../../storage';

function DonationGoalComponent() {
  Component.prototype.constructor.apply(this, arguments);
  var component = this;
  
  storage.get('settings').then(function(settings) {
  
    component.rateType = settings.rateType || 'browsingRate';
    component.render();
  });
}

DonationGoalComponent.prototype = {
  template: 'components/donation-goal/donation-goal.html',

  events: {
    'keyup input[type=text]': 'filterInput',
    'blur input[type=text]': 'formatAndSave',
    'change input[type=text]': 'formatAndSave',
    'change input[type=radio]': 'rateSelected',
    'change select': 'updateInterval'
  },
  
  rateSelected: function(ev) {
    this.updateRateDescription(ev.target.id);
  },
  
  updateInterval: function(ev) {
    var minutes = Number(ev.target.value);
    var component = this;

    return storage.get('settings').then(function(settings) {
      settings.donationInterval = minutes;

      component.updateOwe(settings);

      return storage.set('settings', settings);
    });
  },

  filterInput: function(ev) {
    var val = ev.target.value.replace(/[^0-9.]/g, '');
    this.$('input[type=text]').val('$' + val);
  },

  formatAndSave: function(ev) {
    var component = this;
    var val = ev.target.value.replace(/[^0-9.]/g, '');
    var currency = '$' + parseFloat(val).toFixed(2);

    this.$('input[type=text]').val(currency);

    storage.get('settings').then(function(settings) {
      settings.donationGoal = currency;

      component.updateOwe(settings);

      return storage.set('settings', settings);
    }).catch(function(ex) {
      console.log(ex);
      console.log(ex.stack);
      });
  },
  
  updateRateDescription: function(id) {
    var rateType;
    var component = this;
  	if (id == "browsingRateRadio") {
  	  this.$('.avgTime').text("If you spent 5 minutes browsing ");
  	  rateType = 'browsingRate'
  	}
  	else if (id == "calendarRateRadio") {
  	  this.$('.avgTime').text("After 5 minutes ");
  	  rateType = 'calendarRate';
  	}
  	
  	storage.get('settings').then(function(settings) {
  	  settings.rateType = rateType;
  	  component.rateType = rateType;
  	  return storage.set('settings', settings);
  	}).catch(function(ex) {
      console.log(ex);
      console.log(ex.stack);
      });
  },
  
  updateRateDisplay: function(rateType) {
  
    var id = rateType + 'Radio';
    this.$('#' + id).prop('checked', true);
    this.updateRateDescription(id);

  },

  updateOwe: function(settings) {
    var donationInterval = settings.donationInterval || 60;
    var donationGoal = settings.donationGoal;
    donationGoal = donationGoal ? +donationGoal.slice(1) : 0;

    var est = donationGoal * (5 / donationInterval);

    this.$('.owe').text('$' + est.toFixed(2));
  },

  afterRender: function() {
    var component = this;
    var input = this.$('input[type=text]');
    var select = this.$('select');

    storage.get('settings').then(function(settings) {
      input.val(settings.donationGoal);
      select.find('[value=' + settings.donationInterval + ']')
        .attr('selected', true);

      component.updateOwe(settings);
      settings.rateType = component.rateType;
      component.updateRateDisplay(component.rateType);
      return storage.set('settings', settings);
      
    }).catch(function(ex) {
      console.log(ex);
    });
  }
};

DonationGoalComponent.prototype.__proto__ = Component.prototype;

export default DonationGoalComponent;
