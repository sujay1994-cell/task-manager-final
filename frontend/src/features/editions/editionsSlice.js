import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const requestLaunch = createAsyncThunk(
  'editions/requestLaunch',
  async ({ editionId, launchDate, tasks }) => {
    const response = await api.post(`/api/editions/${editionId}/launch-request`, {
      launchDate,
      tasks
    });
    return response.data;
  }
);

const editionsSlice = createSlice({
  name: 'editions',
  initialState: {
    items: [],
    loading: false,
    error: null,
    launchRequests: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestLaunch.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestLaunch.fulfilled, (state, action) => {
        state.loading = false;
        state.launchRequests.push(action.payload);
      })
      .addCase(requestLaunch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default editionsSlice.reducer; 