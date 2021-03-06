import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Layout, notification } from 'antd';
import { ACCESS_TOKEN } from "../constants";
import { getCurrentUser } from "../util/APIUtils";
import Login from '../user/login/Login';
import AppHeader from '../common/AppHeader'
import {
    Route,
    withRouter,
    Switch,
    Redirect
} from 'react-router-dom';
import Home from '../user/home/Home'
import LoadingIndicator from '../common/LoadingIndicator';

/** Base component class that wraps the entire front end app for page rendering **/
class App extends Component {
    /**
     * initialize component state at mounting time
     * */
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            isLoading: false
        }
        this.handleLogout = this.handleLogout.bind(this);
        this.loadCurrentUser = this.loadCurrentUser.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        notification.config({
            placement: 'topRight',
            top: 70,
            duration: 3,
        });

    }

    /**
     * Load the current user of the page from backend server with AJAX request
     * Set current user and authentication state after request returns
     * */
    loadCurrentUser() {
        this.setState({isLoading: true});
        getCurrentUser()
            .then(response => {
                this.setState({
                    currentUser: response,
                    isAuthenticated: true,
                    isLoading: false
                });
            }).catch(error => {
                this.setState({isLoading: false});
        });
    }
    /**
     * Callback function called after user have logged in successfully
     * Refreshes page before return
     * passed to child components
     * */
    handleLogin() {
        notification.success({
            message: 'SYL App',
            description: "You're successfully logged in.",
        });
        this.loadCurrentUser();
        this.props.history.push("/");
    }

    /**
     * Callback function called after user presses logout button
     * Redirect page to root
     * @param {string} redirectTo - path name for redirection
     * @param {string} notificationType - indicator of successfulness
     * @param {string} description - notification message
     * */
    handleLogout(redirectTo="/", notificationType="success", description="You're successfully logged out.") {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem('mylinks');

        this.setState({
            currentUser: null,
            isAuthenticated: false
        });

        this.props.history.push(redirectTo);

        notification[notificationType]({
            message: 'SYL',
            description: description,
        });
    }


    /**
     * Callback function called at page loading time
     * */
    componentWillMount() {
        this.loadCurrentUser();
    }


    render() {
        if(this.state.isLoading){
            return <LoadingIndicator/>
        }
        return (
            <Layout className="app-container">
                <AppHeader isAuthenticated={this.state.isAuthenticated}
                           currentUser={this.state.currentUser}
                           onLogout={this.handleLogout} />
                <Switch>
                    <Route exact path="/"
                           render={(props) => this.state.isAuthenticated? <Redirect to="/home"/> : <Login onLogin={this.handleLogin} {...props} />}>
                    </Route>
                    <Route path="/home"
                        render={(props) => this.state.isAuthenticated?
                            (<Home isAuthenticated={this.state.isAuthenticated}
                                   currentUser={this.state.currentUser} {...props}/>)
                                :(<Redirect to="/"/>)}>
                    </Route>
                </Switch>
            </Layout>
        )
    }
}

export default withRouter(App);
