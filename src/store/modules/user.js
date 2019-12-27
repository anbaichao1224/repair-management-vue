export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    orgid: 0,
    mobile:'',
    isadmin: 0,
    title: 0
  },
  mutations: {
    updateId (state, id) {
      state.id = id
    },
    updateName (state, name) {
      state.name = name
    },
    updateOrgId (state, orgid) {
      state.orgid = orgid
    },
    updateMobile (state, mobile) {
      state.mobile = mobile
    },
    updateIsadmin (state, isadmin) {
      state.isadmin = isadmin
    },
    updateTitle (state,title){
      state.title = title
    }
  }
}
