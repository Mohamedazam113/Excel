import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { getGlobal } from '../utilities/office-apis-helpers';

import App from './components/App';
import {add, getData} from './functions/functions';

import './styles.less';
import 'office-ui-fabric-react/dist/css/fabric.min.css';

initializeIcons();

let isOfficeInitialized = false;

const title = 'Office-Add-in-Microsoft-Graph-React';

const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <Component title={title} isOfficeInitialized={isOfficeInitialized} />
        </AppContainer>,
        document.getElementById('container')
    );
};

/* Render application after Office initializes */
Office.initialize = async () => {
    let g = getGlobal() as any;
    g.state = {
        'isStartOnDocOpen': false,
        'isSignedIn': false,
        'isTaskpaneOpen': false,
        'isConnected': false,
        'csvData': {
            'july': {
                'apples': 5,
                'pears': 10,
                'oranges': 20
            },
            'august': {
                'apples': 7,
                'pears': 12,
                'oranges': 30

            },
            'september': {
                'apples': 10,
                'pears': 8,
                'oranges': 20

            }
        }
    };
//    g.isStartOnDocOpen = false;
  //  g.isSignedIn = false;

    // @ts-ignore
    let addinState = await Office.addin._getState();
    console.log ("load state is:");
    console.log ("load state" + addinState);
    if (addinState === 'Background'){
        g.state.isStartOnDocOpen = true;
        run();
    }
    if (localStorage.getItem('loggedIn') === 'yes'){
        g.state.isSignedIn = true;
    }

    isOfficeInitialized = true;
   // SetRuntimeVisibleHelper(true);
    // @ts-ignore
    //SetStartupBehaviorHelper(Office.StartupBehavior.load);


    console.log('task pane running');
    CustomFunctions.associate('ADD', add);
    CustomFunctions.associate('GETDATA', getData);
    render(App);
};

async function run() {
    try {
      await Excel.run(async context => {
        /**
         * Insert your Excel code here
         */
        const ws = context.workbook.worksheets.getActiveWorksheet();
        let range = ws.getRange('A1');
        range.load('values');
        return context.sync(range).then( (range) => {
            let v = range.values[0][0];
            v += 1;
            range.values = [[ v ]];
            range.format.autofitColumns();

            return context.sync();
        });
    });
    } catch (error) {
      console.error(error);
    }
  }
/* Initial render showing a progress bar */
render(App);

if ((module as any).hot) {
    (module as any).hot.accept('./components/App', () => {
        const NextApp = require('./components/App').default;
        render(NextApp);
    });
}
