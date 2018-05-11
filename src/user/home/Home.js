import React, { Component } from 'react';
import AppSider from '../../common/AppSider';
import { Layout } from 'antd';
import {
    Route,
    withRouter,
    Switch,
    Link,
    Redirect
} from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import Mylinks from './mylinks/Mylinks';
import CreateLinks from './createlinks/CreateLinks';
const { Content, Sider, Header } = Layout;

class Home extends Component {
    constructor(props) {
        super(props);
    };

    componentWillMount() {
        this.props.history.push("/home/dashboard");
    }
    render() {
        return (
            <Layout style={{ height: '100vh', marginTop: 64 }}>
                <AppSider />
                <Switch>
                    <Route exact path="/home/dashboard" render={(props) =>
                        <Dashboard isAuthenticated={this.isAuthenticated} currentUser={this.currentUser}  {...props} />}>
                    </Route>
                    <Route exact path="/home/mylinks" render={(props) =>
                        <Mylinks isAuthenticated={this.isAuthenticated} currentUser={this.currentUser} {...props} />}>
                    </Route>
                    <Route exact path="/home/createlinks" render={(props) =>
                        <CreateLinks isAuthenticated={this.isAuthenticated} currentUser={this.currentUser} {...props} />}>
                    </Route>
                </Switch>
            </Layout>
        );

    }

}

export default Home;