import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    TextField,
    Typography,
    IconButton,
    Paper,
    Grid
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { announcementService } from '../../services/announcementService';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [error, setError] = useState(null);
    const [dateError, setDateError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await announcementService.getAllAnnouncements();
            setAnnouncements(data);
        } catch (err) {
            setError('Failed to load announcements');
        }
    };

    const validateDates = (start, end) => {
        if (end <= start) {
            setDateError('End time must be after start time');
            return false;
        }
        setDateError(null);
        return true;
    };

    const handleOpenDialog = (announcement = null) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                message: announcement.message,
                endTime: new Date(announcement.endTime).toISOString(),
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({
                title: '',
                message: '',
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });
        }
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setEditingAnnouncement(null);
        setError(null);
        setDateError(null);
    };

    const handleSubmit = async () => {
        try {
            const endDate = new Date(formData.endTime);
            if (!formData.title || !formData.message) {
                setError('Title and message are required.');
                return;
            }
            if (endDate <= new Date()) {
                setError('End time must be in the future.');
                return;
            }
            const payload = {
                title: formData.title,
                message: formData.message,
                endTime: formData.endTime,
            };
            if (editingAnnouncement) {
                await announcementService.updateAnnouncement(editingAnnouncement.announcementId, payload);
            } else {
                await announcementService.createAnnouncement(payload);
            }
            handleCloseDialog();
            loadAnnouncements();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save announcement');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await announcementService.deleteAnnouncement(id);
                loadAnnouncements();
            } catch (err) {
                setError('Failed to delete announcement');
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Announcements</Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleOpenDialog()}
                >
                    Create Announcement
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Grid container spacing={2}>
                {announcements.map((announcement) => (
                    <Grid item xs={12} md={6} key={announcement.announcementId}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6">{announcement.title}</Typography>
                                <Box>
                                    <IconButton onClick={() => handleOpenDialog(announcement)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(announcement.announcementId)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Typography sx={{ mt: 1 }}>{announcement.message}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {new Date(announcement.startTime).toLocaleString()} - {new Date(announcement.endTime).toLocaleString()}
                            </Typography>
                            {announcement.type && (
                                <Typography variant="body2" color="text.secondary">
                                    Type: {announcement.type}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Message"
                            multiline
                            rows={4}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box sx={{ mt: 2 }}>
                                <DateTimePicker
                                    label="End Time"
                                    value={new Date(formData.endTime)}
                                    onChange={(date) => {
                                        if (date) {
                                            setFormData({ ...formData, endTime: date.toISOString() });
                                        }
                                    }}
                                />
                            </Box>
                        </LocalizationProvider>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={!formData.title || !formData.message}
                    >
                        {editingAnnouncement ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnnouncementManagement; 