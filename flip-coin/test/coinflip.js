const CoinFlip = artifacts.require("./CoinFlip.sol");

contract("CoinFlip", function(accounts){

  const bank_value = 50000;
  const wallet1 = accounts[0];

  beforeEach('setup contract for each test', async() => {
    CoinFlipInstance = await CoinFlip.new({value: bank_value});
  })

  /*
  *  Simple tests of getter
  */

  it("...[simple] Should set the initial bank address with account[0]", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    assert.equal(banksaddr[0], wallet1, "The contract is not set with the first account.");
  });

  it("...[simple] Should set the initial bank deposit with the value of 'bank_value'", async () => {
    const value = await CoinFlipInstance.getBankBalance.call(wallet1);
    assert.equal(value, bank_value, "The value 'bank_value' was not stored.");
  });

  it("...[simple] User historic should be 0", async () => {
    const value = await CoinFlipInstance.getUserHistory.call(wallet1);
    assert.equal(value, 0, "The value of user history is not 0");
  });

  it("...[simple] Should set the initial lastFlip to false", async () => {
    const value = await CoinFlipInstance.getLastFlip.call(wallet1);
    assert.equal(false, value, "The value lastFlip should be equal to zero");
  });

  /*
  *  Flip require test 
  */

  it("...[flip] A bet value should be maximum half of the bank value", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    const initial_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    const good_bet_value = initial_value/2;
    let is_error = 0;
    try {
    	await CoinFlipInstance.flip(banksaddr[0], { from: wallet1, value: good_bet_value, gas: 900000});
    } catch (error){
    	is_error = 1;
    }
    assert.equal(false, is_error, "The value sent to last flip is suppose to be good");
  });

  it("...[flip] A bet value should be less than 0.5 ether", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    const initial_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    const wrong_bet_value = 500000000000000000; // 0.5 ether
    let is_error = 0;
    try {
    	await CoinFlipInstance.flip(banksaddr[0], { from: wallet1, value: wrong_bet_value, gas: 900000});
    } catch (error){
    	is_error = 1;
    }
    assert.equal(true, is_error, "The value sent to last flip is suppose to be less than 0.5 eth");
  });

  it("...[flip] A bet value should be more than 0 wei", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    const initial_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    const wrong_bet_value = 0; // 0.5 ether
    let is_error = 0;
    try {
    	await CoinFlipInstance.flip(banksaddr[0], { from: wallet1, value: wrong_bet_value, gas: 900000});
    } catch (error){
    	is_error = 1;
    }
    assert.equal(true, is_error, "The value sent to last flip is suppose to be more than 0 wei");
  });

  it("...[flip] A bet value up to the maximum of half of the bank value should be wrong", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    const initial_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    const wrong_bet_value = initial_value/2+1000;
    let is_error = 0;
    try {
    	await CoinFlipInstance.flip(banksaddr[0], { from: wallet1, value: wrong_bet_value, gas: 900000});
    } catch (error){
    	is_error = 1;
    }
    assert.equal(true, is_error, "The value sent to last flip is suppose to be wrong");
  });

  /*
  *  Combined tests -> 2 functions call maximum
  */

  it("...[complex] Should send 5000 to the bank, the bank balance should be 'bank_value' + 5000", async () => {
    let amount_sent = 5000;
    await CoinFlipInstance.sendMoneyToTheBank(wallet1, {value: amount_sent});
    const value = await CoinFlipInstance.getBankBalance.call(wallet1);
    assert.equal(value, bank_value + amount_sent, "The value 15000 was not stored.");
  });

  /*
  *	 Mutliples tests
  */

  it("...[complex] After a flip the balance of the bank and the user should be balance", async () => {
    const banksaddr = await CoinFlipInstance.getListOfBank();
    const amount_bet = 5000;
    const initial_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    try{
    	await CoinFlipInstance.flip(banksaddr[0], { from: wallet1, value: amount_bet, gas: 900000});
    } catch (error){
    	assert(error.toString().includes('invalid opcode'), error.toString());
    }
    const lastflip = await CoinFlipInstance.getLastFlip(wallet1);
    let rst = 0;
    (lastflip == true) ? rst = amount_bet : rst = -amount_bet;
    const last_call_history = await CoinFlipInstance.getUserHistory.call(wallet1);
    const current_value = await CoinFlipInstance.getBankBalance.call(wallet1);
    assert.equal(last_call_history, rst, "The value of user history is not equal to the result of the flip");
    assert.equal(current_value, initial_value - rst , "The balance of the bank is not equal to the initial value plus the result the flip");
  });

});
