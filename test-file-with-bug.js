// Test file for review skill validation
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {  // Off-by-one: should be < not <=
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function processUser(user) {
  const name = user.name;
  const email = user.emal;  // Typo: should be 'email'
  return { name, email };
}

module.exports = { calculateTotal, processUser };
