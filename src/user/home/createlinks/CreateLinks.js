import React, { Component } from 'react';
import { Table, Form, Input, Icon, Button, Card, Col, Row, Popover } from 'antd';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    withRouter
} from 'react-router-dom';
import {Layout, notification} from "antd/lib/index";
import {createLink, getAllLinks} from "../../../util/APIUtils";
import './CreateLinks.css'
const FormItem = Form.Item;
const { Content } = Layout;

/** Component class that renders the createlinks page */
class CreateLinks extends Component {
    /** Constructor that sets initial component state at mount time */
    constructor(props){
        super(props);
        this.handleCreate = this.handleCreate.bind(this);
        notification.config({
            placement: 'topRight',
            top: 70,
            duration: 3,
        });
        this.createdLinks = [];
        this.linkTable = [];
        this.reloadedLinks = [];
        this.last = true;
        this.page = 0;
    }
    /**
     * function that try to load user's SYL links from backend
     * and store in localStorage
     * @param {number} page - page number of pagination response from backend server
     * @param {number} size - number of links for each pagination response
     * */
    loadLinks(page = 0, size = 30){
        let promise;
        promise = getAllLinks(page,size);
        if (!promise) {
            return;
        }

        this.setState({isLoading: true});
        promise
            .then(response => {
                response.content.forEach((row) => {
                    date = new Date(row.creationDate);
                    row.creationDate = date.toDateString()});
                this.reloadedLinks = this.reloadedLinks.concat(response.content);
                this.page = response.page;
                this.last = response.last;
                if (response.last) {
                    localStorage.setItem('mylinks', JSON.stringify(this.reloadedLinks));
                    localStorage.setItem('totalPages',response.totalPages.toString());
                    localStorage.setItem('totalElements', response.totalElements.toString());
                }
            }).catch(error => {
            this.last = true;
        });
        if (!this.last) {
            this.loadLinks(this.page + 1);
        }
    }

    /** Callback function that gets called after user clicks on the copy to clipboard button */
    onCopy() {
        notification.success({
            message: 'SYL App',
            description: "Copied link to clipboard!",
        });
    }

    /** Callback function that gets called after creating SYL links. The function stores the created
     * links to component state and re-renders component
     * */
    handleCreate(links){
        notification.success({
            message: 'SYL App',
            description: "Link creation succeeded.",
        });
        this.createdLinks = links;
        let dataSource = this.createdLinks;
        let columns = [{
            title: 'Cents per click',
            dataIndex: 'ecpc',
            key: 'earnings',
            width: '50%'
        },{
            title: 'SYL link',
            key: 'link',
            width: '50%',
            render: (record) =>
                <Popover content={
                    <CopyToClipboard
                        onCopy={this.onCopy}
                        text={record.link}>
                        <Button type={'primary'}>Copy to Clipboard</Button>
                    </CopyToClipboard>}
                         title={"Press the button to copy your SYL link"}
                         trigger={'click'}>
                    <a>{record.link}</a>
                </Popover>
        }];
        this.linkTable = [
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Your links">
                        <Table dataSource={dataSource} columns={columns} />
                    </Card>
                </Col>
            </Row>
        ];
        this.loadLinks();
        this.props.history.push("/home/createlinks");

    }
    render() {
        const AntWrappedLinkForm = Form.create()(LinkForm);
        return (
            <Layout className="createlinks-layout" style={{ padding: '0 0px 0px', background: '#ECECEC' }}>
                <Content className="createlinks-content" >
                    <div className="content-container" style={{ background: '#ECECEC', padding: '0' }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Card title="Create links">
                                    <AntWrappedLinkForm onCreate={this.handleCreate} />
                                </Card>
                            </Col>
                        </Row>
                        {this.linkTable}
                    </div>
                </Content>
            </Layout>
        );
    }
}







let uuid = 0;
/** Component class that renders the form component that takes user input urls to be converted to SYL links */
class LinkForm extends Component {
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /** Callback function that gets called when user clicks on the remove button.
     * Removes the corresponding field of the form
     * @param {number} k - key of form field
     * */
    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one link
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    /** Function to remove all input fields */
    removeAll = () => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const names = form.getFieldValue('names');
        console.log(keys);
        console.log(names);
        form.resetFields();
        form.setFieldsValue({names: names.splice(0,names.length)});
        const keys1 = form.getFieldValue('keys');
        const names1 = form.getFieldValue('names');
        console.log(keys1);
        console.log(names1);
    }


    /** Function to add field to form */
    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        uuid++;
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    }


    /** Callback function that gets called when user submit form. Contect backend server to convert input urls to
     * SYL links.
     * */
    handleSubmit(event) {
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!values.names){return;}
            if (!err) {
                let createFormRequest = {urls:values.names.filter(name => name !== null)};
                createLink(createFormRequest).then(response => {
                       this.props.onCreate(response.generatedLinks);
                    }).catch(error => {
                    notification.error({
                        message: 'SYL',
                        description: 'Failed to create links!'
                    })

                });
                this.removeAll();
            }
        });
    }

    // handleSubmit = (e) => {
    //     e.preventDefault();
    //     this.props.form.validateFields((err, values) => {
    //         if (!err) {
    //             console.log('Received values of form: ', values);
    //         }
    //     });
    // }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        };
        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => {
            return (
                <FormItem
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'URLs' : ''}
                    required={false}
                    key={k}
                >
                    {getFieldDecorator(`names[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: "Please input url or delete this field.",
                        }],
                    })(
                        <Input placeholder="Url" style={{ width: '60%', marginRight: 8 }} />
                    )}
                    {keys.length > 1 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            disabled={keys.length === 1}
                            onClick={() => this.remove(k)}
                        />
                    ) : null}
                </FormItem>
            );
        });
        return (
            <Form onSubmit={this.handleSubmit}>
                {formItems}
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                        <Icon type="plus" /> Add field
                    </Button>
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </FormItem>
            </Form>
        );
    }

}

export default withRouter(CreateLinks);