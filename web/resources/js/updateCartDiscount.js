window.axios = require('axios');

var pay_period = document.querySelector('#pay_period');
var domain = 'https://baghdad-wit-poverty-fc.trycloudflare.com';
pay_period.addEventListener('change', function () {
  var pay_period_val = pay_period.value;
  var cartId = '';
  axios.get('cart.js').then(function (response) {
    cartId = response.data.token;
    axios.post(domain + '/api/updateCartDiscount',  {
        pay_period_val: pay_period_val,
        cartId: cartId
      }).then(function (re) {
        var totalAmount = re.data.data.cartDiscountCodesUpdate.cart.cost.totalAmount.amount;
        var currencyCode = re.data.data.cartDiscountCodesUpdate.cart.cost.totalAmount.currencyCode;
        document.querySelector('.totals__subtotal-value').innerHTML = totalAmount + ' ' + currencyCode;

    })["catch"](function (e) {
      console.log(e);
    });
  })["catch"](function (error) {
    console.log(error);
  });
  
});