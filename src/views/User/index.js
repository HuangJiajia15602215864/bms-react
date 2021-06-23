import React from 'react'
import { Form, Row, Col, Input, Button, Select, Space, Table, Modal, message } from 'antd'

import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

import UpdateUser from './updateUser'

const {$http} = React
const searchItem = [// 筛选条件
  { key: 'username', name: 'username', label: '用户名', defaultValue: null, type: 'input', placeholder: '请输入' },
  { key: 'email', name: 'email', label: '邮箱', defaultValue: null, type: 'input', placeholder: '请输入' },
  { key: 'sex', name: 'sex', label: '性别', defaultValue: -1, type: 'select', options: [
    { value: -1, label: '不限' },
    { value: 0, label: '男' },
    { value: 1, label: '女'}
  ], placeholder: '请选择' }
]

class User extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedRowKeys: [],// 选中行
      loading: false,// 是否加载
      query: {// 筛选条件
        username: '',
        email: '',
        sex: -1
      },
      userTableData: [],// 用户列表数据
      pagination: {// 分页
        current: 1,
        pageSize: 10,
        total: 0
      },
      columns: [// 表格列
        { title: '用户名', dataIndex: 'username',align:'center' },
        { title: '性别', dataIndex: 'sex',align:'center', render: (text, record) => {
          return (
            <span>{text === 0 ? '男' : '女'}</span>
          )
        }},
        { title: '联系方式', dataIndex: 'phone',align:'center' },
        { title: '邮箱地址', dataIndex: 'email',align:'center' },
        { title: '创建时间', dataIndex: 'createDate' ,align:'center'},
        { title: '操作', key: 'action',align:'center', render: (text, record) => {
          return (
            <React.Fragment>
              <Button type="link" onClick={() => this.onEdit(record)}><EditOutlined />编辑</Button>
              <Button type="link" onClick={() => this.onDelete(record)}><DeleteOutlined />删除</Button>
            </React.Fragment>
          )
        }},
      ],
      modalVisible: false,// 弹窗是否显示
      modalForm: {},// 弹窗内容
      modalType: 'add'// 弹窗类型
    }
  }

  // 引用
  formRef = React.createRef()
  modalRef = null

  componentDidMount() {
    this.getUserList()
  }

  // 获取用户列表
  getUserList = () => {
    const { query, pagination } = this.state
    const params = {}// 组装接口参数
    for (let key in query) {
      if (query[key]) params[key] = query[key]
    }
    params['page'] = pagination.current
    params['pageSize'] = pagination.pageSize

    this.setState({loading: true})
    $http.get('user/list', { params }).then(res => {
      const { list, ...pagination } = res
      this.setState({ userTableData: list, pagination: {
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total
      }, loading: false })
    })
  }
 
  // 查询
  onSearch = values => {
    this.setState({ query: values }, () => {
      this.getUserList()
    })
  }

  // 选中行变化
  onSelectedChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  // 分页变化
  paginationChange = (pagination) => {
    this.setState({pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
    }}, () => {
      this.getUserList()
    })
  }

  // 编辑
  onEdit = (record) => {
    this.setState({
      modalVisible: true,
      modalForm: record,
      modalType: 'edit'
    }, () => {
      // ref 引用问题
      setTimeout(() => {
        this.modalRef.formRef.current.setFieldsValue({
          id: record.id,
          username: record.username,
          sex: record.sex,
          phone: record.phone,
          email: record.email
        })
      }, 100)
    })
  }

  // 删除
  onDelete = (record) => {
    Modal.confirm({
      title: '删除用户',
      icon: <ExclamationCircleOutlined />,
      content: (<span>确认删除用户<span className="text-light-red">{record.username}</span>吗？</span>),
      onOk: () => {
        $http.delete('user/delete', { data: {id: record.id} }).then(res => {
          message.success('删除成功')
          this.getUserList()
        })
      }
    })
  }

  // 批量删除
  onMultipleDelete = () => {
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      return message.error('请先选择删除的用户！')
    }
    $http.delete('user/delete', { data: {ids: selectedRowKeys} }).then(res => {
      message.success('删除成功')
      this.setState({ selectedRowKeys: [] }, () => this.getUserList())
    })
  }

  // 添加
  onOpenModal = () => {
    this.setState({modalVisible: true, modalType: 'add', modalForm: null})
  }

  // 弹窗保存
  onModalSave = (values) => {
    console.log(values)
    const { modalForm, modalType } = this.state
    if (modalType === 'add') {
      $http.post('user/create', values).then(res => {
        message.success('添加成功')
        this.onModalCancel()
      })
    } else {
      values.id = modalForm.id
      $http.put('user/edit', values).then(res => {
        message.success('修改成功')
        this.onModalCancel()
      })
    }
  }

  // 弹窗取消
  onModalCancel = () => {
    this.modalRef.formRef.current.resetFields()
    this.setState({modalVisible: false, modalType: 'add', modalForm: null})
  }

  render() {
    const { loading, selectedRowKeys, columns, userTableData, pagination, modalVisible, modalType } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectedChange
    }
    const getFields = () => {
      const children = searchItem.map(item => (
        <Col span={4} key={item.key}>
          <Form.Item
            name={item.name}
            label={item.label}
            initialValue={item.defaultValue}>
              {item.type === 'input' ?
                <Input placeholder={item.placeholder} /> :
                <Select>
                  {item.options.map(option => (
                    <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                  ))}
                </Select>}
          </Form.Item>
        </Col>
      ))
      return children
    }
    const searchControl = (
      <Col span={6}>
        <Space>
          <Button type="primary" htmlType="submit">查询</Button>
          <Button onClick={() => this.formRef.current.resetFields()}>重置</Button>
        </Space>
      </Col>
    )
    return (
      <div>
        <Form ref={this.formRef}
          name="search"
          onFinish={this.onSearch}>
            <Row gutter={24}>
              {getFields()}
              {searchControl}
              <Space className="mb-35">
                <Button onClick={this.onOpenModal} className="button-color-green"><PlusOutlined />添加</Button>
                <Button type="danger" onClick={this.onMultipleDelete}><DeleteOutlined />批量删除</Button>
              </Space>
            </Row>
        </Form>
        <Table loading={loading} rowSelection={rowSelection} columns={columns} pagination={pagination} onChange={this.paginationChange} dataSource={userTableData} />
        <UpdateUser ref={f => this.modalRef = f} modalType={modalType} visible={modalVisible} onSave={this.onModalSave} onCancel={this.onModalCancel} />
      </div>
    )
  }
}

export default User