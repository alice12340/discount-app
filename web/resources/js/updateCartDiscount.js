window.axios = require('axios');
var domain = 'https://carmen-grocery-israeli-llp.trycloudflare.com';
//get cart attributes from cart.js
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
  //get the options from localstorage first then from the api
  if (!localStorage.getItem('config')){
    axios.get(domain + '/api/getCartDiscounts').then(function (re) {
      localStorage.setItem('config', JSON.stringify(re.data));
      
    }).catch(function (e) {
      console.log(e);
    });
  }
  const data = JSON.parse(localStorage.getItem('config'));
  for (const key in data) {
    selectContext += '<option\
    value="'+data[key].value+'"';
    if (parseInt(data[key].value) == parseInt(payPeriod)) {
      selectContext += ' selected="selected"';
    }
    selectContext += '>'+data[key].title+'</option>';
  }
  document.querySelector('#payPeriodDiv').innerHTML = selectContext;

}).catch(function (e) {
  console.log(e);
});

