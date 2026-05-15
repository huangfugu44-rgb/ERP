import { getUserInfo, login as apiLogin, logout as apiLogout } from '@/api/auth';

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: null,
  roles: [],
  permissions: [],
};

const getters = {
  token: (state) => state.token,
  userInfo: (state) => state.userInfo,
  roles: (state) => state.roles,
  permissions: (state) => state.permissions,
  isLoggedIn: (state) => !!state.token,
};

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo;
    state.roles = userInfo?.roles || [];
    state.permissions = userInfo?.permissions || [];
  },
  CLEAR_USER(state) {
    state.token = '';
    state.userInfo = null;
    state.roles = [];
    state.permissions = [];
    localStorage.removeItem('token');
  },
};

const actions = {
  async login({ commit }, credentials) {
    try {
      const response = await apiLogin(credentials);
      const { token, userInfo } = response.data;
      commit('SET_TOKEN', token);
      commit('SET_USER_INFO', userInfo);
      return response;
    } catch (error) {
      commit('CLEAR_USER');
      throw error;
    }
  },
  async getUserInfo({ commit, state }) {
    try {
      if (!state.token) {
        throw new Error('Token不存在');
      }
      const response = await getUserInfo();
      commit('SET_USER_INFO', response.data);
      return response.data;
    } catch (error) {
      commit('CLEAR_USER');
      throw error;
    }
  },
  async logout({ commit }) {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      commit('CLEAR_USER');
    }
  },
  resetToken({ commit }) {
    commit('CLEAR_USER');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
