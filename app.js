// Assume we got the data from the server as json and "accounts" is the parsed version
var accounts = [
  {
    id: 1,
    type: 'IRA',
    number: 5200,
    availableCashToday: 5763.36,
    availableCashYesterday: 5767.97
  },
  {
    id: 2,
    type: 'AAA',
    number: 1812,
    availableCashToday: 2010926.1,
    availableCashYesterday: 2006703.16
  },
  {
    id: 3,
    type: 'AAA',
    number: 3810,
    availableCashToday: 10050054.07,
    availableCashYesterday:  10043019
  },
  {
    id: 4,
    type: 'REG',
    number: 2019,
    availableCashToday: 13465679.34,
    availableCashYesterday: 13465679.34
  },
  {
    id: 5,
    type: 'IRA',
    number: 146,
    availableCashToday: 15884302.39,
    availableCashYesterday: 15879537
  },
  {
    id: 6,
    type: 'AAA',
    number: 29,
    availableCashToday: 39160334.42,
    availableCashYesterday: 39187746.6
  },
];

var computeAbsDifference = function(today, yesterday) {
	return Math.abs(today - yesterday).toFixed(2);
};

var getCashDifference = function(today, yesterday) {
	return '$' + computeAbsDifference(today, yesterday);
};

var computePercentChange = function(today, yesterday) {
	return ((computeAbsDifference(today, yesterday)/yesterday) * 100).toFixed(2) + '%';
};

var getAccountName = function(type, number) {
	if(number < 99) {
  	number = '00' + number;
  }
	if(number > 99 && number < 999) {
  	number = '0' + number;
  }
	return type + ' - ' + number;
};

var getTodaysChangeColor = function(today, yesterday) {
	if(today < yesterday) {
  	return 'row-cash-negative';
  }
  
  if(today > yesterday) {
  	return 'row-cash-positive';
  }
  
	return 'row-cash-no-change';
};

var formatMoneyForDisplay = function(money) {
	return '$' + money.toLocaleString();
};

var AccountsHeader = React.createClass({  
  sortByField: function(field) {
  	var sortable = this.props.sortable;
    var direction = sortable.direction === 'asc' ? 'desc' : 'asc'
    var propertyToSortBy = field === 'accounts' ? 'number' : 'availableCashToday';
    
    console.log('Sorting by ' + field + '!');
    
    this.props.sortTable(propertyToSortBy, direction);  	
  },
  
	handleHeaderClick: function(event) {
  	var field = event.target.className === 'col-account-title' ? 'accounts' : 'cash';
    this.sortByField(field);
  },
  
  renderHeaderFields: function() {
    var sortable = this.props.sortable;
    if(sortable.field === 'accounts') {
      return (
      	<tr>
          <th className='col-account-title' onClick={this.handleHeaderClick}>
            Account
            { sortable.direction === 'asc' ?
                <i className="fa fa-angle-up accounts-angle-arrow"></i> :
                <i className="fa fa-angle-down accounts-angle-arrow"></i>
            }
          </th>
          <th className='col-cash-title' onClick={this.handleHeaderClick}>
            <h4>Available Cash</h4>
            <h4 className='todays-change' >Today's Change</h4>
          </th>
        </tr>
      )
    } else {
      return (
      	<tr>
          <th className='col-account-title' onClick={this.handleHeaderClick}>
            Account
          </th>          
          <th className='col-cash-title' onClick={this.handleHeaderClick}>
            { sortable.direction === 'asc' ? 
                <i className="fa fa-angle-up cash-angle-arrow"></i> :
                <i className="fa fa-angle-down cash-angle-arrow"></i> }
            <h4 className='available-cash'>Available Cash</h4>
            <h4 className='todays-change' >Today's Change</h4>
          </th>
        </tr>
      )
    }
	},

	render: function() {    
    
  	return(
      <thead>
        {this.renderHeaderFields()}
      </thead>
    )
  }

});

var AccountsBody = React.createClass({
	render: function() {
  	var cashToday;
    var cashYesterday;
    var accountsToDisplay = this.props.accounts.slice(0,this.props.displayLimit);

  	return(
      <tbody>
        {accountsToDisplay.map((account, index) => {
        	cashToday = account.availableCashToday;
          cashYesterday = account.availableCashYesterday; 
          return (
            <tr key={index} className='accounts-row'>
              <td className='row-account'>
								{getAccountName(account.type, account.number)}
              </td>
              <td className='row-cash'>
                <p>
                	{formatMoneyForDisplay(cashToday)}
                </p>
								<p className={'row-cash-change ' + getTodaysChangeColor(cashToday, cashYesterday) }>
                	{ computePercentChange(cashToday, cashYesterday) + ' / ' + getCashDifference(cashToday, cashYesterday)}
                </p>
              </td>
            </tr>
          )
        })}
      </tbody>
    )
  }
});

var AccountsLoadMore = React.createClass({
	loadMore: function() {
  	this.props.loadMore();
  },

	render: function() {
  	return(
      <tfoot>
        <tr>
          <td colSpan='2' className='load-more'>
          	<button type='button' onClick={this.loadMore}>
	            Load more
            </button>
          </td>
          <td>
          </td>
        </tr>
      </tfoot>
    )
  }
});

var AccountsTable = React.createClass({ 
	getInitialState: function() {
  	return {
    	displayLimit: 3,
     	limitIncrement: 3,
      accounts: _.sortBy(accounts, 'number'),
      // keep track of the sorted state of the table
      sortable: {
      	field: 'accounts', //possible values are 'accounts' or 'cash'
        direction: 'asc' //possible values are 'asc' or 'desc'
      }
    };
  },

  sortTable: function(sortBy, direction){
    var accounts = this.state.accounts.slice();

  	var sortedAccounts = direction === 'asc' ? 
    	_.sortBy(accounts, sortBy) : _.sortBy(accounts, sortBy).reverse();
  	
    var field = sortBy === 'number' ? 'accounts' : 'cash';
    
		this.setState({
    	accounts: sortedAccounts,
      sortable: {
      	field: field,
        direction: direction
      }
    });
  },
  
  loadMore: function() {
  	this.setState({
    	displayLimit: this.state.displayLimit + this.state.limitIncrement
    });
  },

  render: function() {
    return (
    	<div className='main'>
        <table id='table' className='accounts-table'>
          <AccountsHeader 
          	sortTable={this.sortTable}
            sortable={this.state.sortable}
          />
          <AccountsBody 
          	displayLimit={this.state.displayLimit}
            accounts={this.state.accounts}
          />
          {accounts.length !== this.state.displayLimit && <AccountsLoadMore 
          	loadMore={this.loadMore}
          />}
       	</table>
     </div>
    )
  }
});

ReactDOM.render(
  <AccountsTable />,
  document.getElementById('container')
);
