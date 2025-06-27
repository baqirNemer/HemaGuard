// DoctorStats.js
import React from 'react';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' },
];

function extractDoctorNote(description) {
  const match = description?.match(/\[DoctorNote:"([^"]+)"\]/);
  return match ? match[1] : '';
}


const DoctorStats = ({ stats, timeFilter, years, handleTimeFilterChange }) => {
  const getTimeLabel = () => {
    if (timeFilter.interval === 'all') return 'All time records';
    if (timeFilter.interval === 'year') return `Records from ${timeFilter.year}`;
    if (timeFilter.interval === 'month') {
      const monthObj = months.find(m => m.value === timeFilter.month);
      return `Records from ${monthObj?.name || ''} ${timeFilter.year}`;
    }
    return '';
  };

  return (
    <Box>
      {/* Header & Filter Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Medical Records Statistics</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Interval</InputLabel>
            <Select
              name="interval"
              value={timeFilter.interval}
              onChange={handleTimeFilterChange}
              label="Time Interval"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>

          {(timeFilter.interval === 'year' || timeFilter.interval === 'month') && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={timeFilter.year}
                onChange={handleTimeFilterChange}
                label="Year"
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {timeFilter.interval === 'month' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select
                name="month"
                value={timeFilter.month}
                onChange={handleTimeFilterChange}
                label="Month"
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>{month.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Statistic Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Records</Typography>
              <Typography variant="h3" sx={{ my: 2 }}>{stats.totalRecords}</Typography>
              <Typography variant="body2">{getTimeLabel()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unique Patients</Typography>
              <Typography variant="h3" sx={{ my: 2 }}>{stats.recordsPerPatient.length}</Typography>
              <Typography variant="body2">
                {timeFilter.interval === 'all'
                  ? 'All patients'
                  : timeFilter.interval === 'year'
                  ? `Patients in ${timeFilter.year}`
                  : `Patients in ${months[timeFilter.month - 1].name}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Categories Used</Typography>
              <Typography variant="h3" sx={{ my: 2 }}>{stats.recordsByCategory.length}</Typography>
              <Typography variant="body2">
                {timeFilter.interval === 'all'
                  ? 'All categories'
                  : timeFilter.interval === 'year'
                  ? `Categories in ${timeFilter.year}`
                  : `Categories in ${months[timeFilter.month - 1].name}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Records by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Records by Category</Typography>
              {stats.recordsByCategory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No data to display.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.recordsByCategory}
                    margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#008A88" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Most Recent Activity</Typography>
              <List dense>
                {stats.recentActivity.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No records found." />
                  </ListItem>
                )}
                {stats.recentActivity.map((log, idx) => (
                  <React.Fragment key={log._id || idx}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={"Email: " + log.patient_email}
                        secondary={ 
                         
                          <>
                            <Typography variant="body2" color="text.secondary">
                               Doctor's Note: {extractDoctorNote(log.description)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {idx < stats.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

            </CardContent>
          </Card>
        </Grid>

        {/* Top Patients by Record Count */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {timeFilter.interval === 'all'
                  ? 'Patients with Most Records'
                  : timeFilter.interval === 'year'
                  ? `Patients with Most Records in ${timeFilter.year}`
                  : `Patients with Most Records in ${months[timeFilter.month - 1].name}`}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.recordsPerPatient.sort((a, b) => b.count - a.count).slice(0, 5)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="email" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#006666" name="Records" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorStats;
