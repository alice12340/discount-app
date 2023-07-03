window.axios = require('axios');
var domain = 'https://pipe-channels-fan-housewares.trycloudflare.com';
axios.get('cart.js').then(function (response) {
  var payPeriod = response.data.attributes.payPeriod;
  console.log(payPeriod);
  var selectContext = '<p class="cart-attribute__field">\
  <label>Pay period</label><br>\
  <select id="pay-period" name="attributes[payPeriod]" style="width: 100px;"><option  value="-1"';
      if (payPeriod == '-1'){
        selectContext += ' selected="selected"';
      }
    selectContext += '>please select</option>';
  
  axios.get(domain + '/api/getCartDiscounts').then(function (re) {
    for (const key in re.data) {
      selectContext += '<option\
      value="'+re.data[key].value+'"';
      if (parseInt(re.data[key].value) == parseInt(payPeriod)) {
        selectContext += ' selected="selected"';
      }
      selectContext += '>'+ re.data[key].title+'</option>';
    };
  
    document.querySelector('#payPeriodDiv').innerHTML = selectContext;
  }).catch(function (e) {
    console.log(e);
  });


}).catch(function (e) {
  console.log(e);
});

