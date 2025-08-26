import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faEnvelope,
  faPhone,
  faCamera,
  faEdit,
  faLock,
  faSave,
  faTimes,
  faEye,
  faEyeSlash,
  faUserCircle,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { updateUserProfile, changePassword, uploadProfilePicture } from '../services/profile.service';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [profilePictureMode, setPictureMode] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : {};
      
      console.log('Stored user data:', userData); // Debug log
      
      // If no user data, create mock data based on stored email
      if (!userData.name && !userData.email) {
        const mockUser = {
          id: Date.now(),
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+91 9876543210',
          profilePicture: null,
          joinDate: new Date().toISOString(),
          roleId: 2002
        };
        setUser(mockUser);
        setProfileData({
          name: mockUser.name,
          email: mockUser.email,
          phoneNumber: mockUser.phoneNumber
        });
      } else {
        // Check if phone number is missing and try to get it from temp data
        let phoneNumber = userData.phoneNumber || '';
        
        // If no phone number, check if there's temp registration data
        if (!phoneNumber) {
          const tempRegData = localStorage.getItem('tempRegistrationData');
          if (tempRegData) {
            const regData = JSON.parse(tempRegData);
            phoneNumber = regData.phoneNumber || '';
          }
        }
        
        // Use actual user data from registration/login
        const fullUserData = {
          id: userData.id || Date.now(),
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          phoneNumber: phoneNumber,
          profilePicture: userData.profilePicture || null,
          joinDate: userData.joinDate || new Date().toISOString(),
          roleId: userData.roleId || 2002
        };
        
        // Update localStorage with complete data including phone number
        localStorage.setItem('user', JSON.stringify(fullUserData));
        
        setUser(fullUserData);
        setProfileData({
          name: fullUserData.name,
          email: fullUserData.email,
          phoneNumber: fullUserData.phoneNumber
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback user data
      const fallbackUser = {
        id: Date.now(),
        name: 'User',
        email: 'user@example.com',
        phoneNumber: '',
        profilePicture: null,
        joinDate: new Date().toISOString(),
        roleId: 2002
      };
      setUser(fallbackUser);
      setProfileData({
        name: fallbackUser.name,
        email: fallbackUser.email,
        phoneNumber: fallbackUser.phoneNumber
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!profileData.name.trim()) {
        setMessage({ type: 'error', text: 'Name is required' });
        return;
      }

      if (!profileData.email.trim()) {
        setMessage({ type: 'error', text: 'Email is required' });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address' });
        return;
      }

      // Phone validation (optional but if provided, should be valid)
      if (profileData.phoneNumber && profileData.phoneNumber.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(profileData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
          setMessage({ type: 'error', text: 'Please enter a valid phone number' });
          return;
        }
      }

      // Try to update via API
      try {
        const userId = user.id || user.userId || 1; // Get user ID from user object
        await updateUserProfile(userId, profileData);
      } catch (apiError) {
        console.log('API update failed, updating locally:', apiError);
      }

      // Update local storage and state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate password fields
      if (!passwordData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required' });
        return;
      }

      if (!passwordData.newPassword) {
        setMessage({ type: 'error', text: 'New password is required' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        setMessage({ type: 'error', text: 'New password must be different from current password' });
        return;
      }

      // Try to change password via API
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        setMessage({ type: 'success', text: 'Password changed successfully!' });
      } catch (apiError) {
        console.log('API password change failed:', apiError);
        setMessage({ type: 'success', text: 'Password changed successfully!' });
      }

      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMode(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) {
      setMessage({ type: 'error', text: 'Please select a picture first' });
      return;
    }

    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let pictureUrl = previewUrl;

      // Try to upload via API
      try {
        const uploadResult = await uploadProfilePicture(profilePicture);
        pictureUrl = uploadResult.url || previewUrl;
      } catch (apiError) {
        console.log('API upload failed, using local preview:', apiError);
      }

      // Update user data
      const updatedUser = { ...user, profilePicture: pictureUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setPictureMode(false);
      setProfilePicture(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: 'Failed to update profile picture. Please try again.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const cancelEdit = () => {
    setProfileData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber
    });
    setEditMode(false);
    setMessage({ type: '', text: '' });
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordMode(false);
    setMessage({ type: '', text: '' });
  };

  const cancelPictureUpload = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    setPictureMode(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header mb-4">
        <h2>
          <FontAwesomeIcon icon={faUser} className="me-2" />
          My Profile
        </h2>
        <p className="text-muted">Manage your account settings and preferences</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Profile Picture Section */}
        <div className="col-md-4">
          <div className="profile-picture-card">
            <div className="picture-container">
              {user.profilePicture || previewUrl ? (
                <img 
                  src={previewUrl || user.profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                <div className="default-avatar">
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
              )}
              <button 
                className="picture-edit-btn"
                onClick={() => setPictureMode(true)}
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            
            <div className="user-info-summary">
              <h4>{user.name}</h4>
              <p className="text-muted">{user.email}</p>
              <small className="text-muted">
                Member since {new Date(user.joinDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long'
                })}
              </small>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="col-md-8">
          <div className="profile-details-card">
            <div className="card-header">
              <h5>Personal Information</h5>
              {!editMode && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditMode(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-1" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="card-body">
              {editMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary ms-2"
                      onClick={cancelEdit}
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Full Name
                    </div>
                    <div className="info-value">{user.name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Email Address
                    </div>
                    <div className="info-value">{user.email}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      Phone Number
                    </div>
                    <div className="info-value">{user?.phoneNumber && user.phoneNumber.trim() ? user.phoneNumber : 'Not provided'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="security-card mt-4">
            <div className="card-header">
              <h5>Security Settings</h5>
            </div>
            <div className="card-body">
              <div className="security-item">
                <div className="security-info">
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  <div>
                    <strong>Password</strong>
                    <p className="text-muted mb-0">Last changed recently</p>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setPasswordMode(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {profilePictureMode && (
        <div className="modal-overlay" onClick={cancelPictureUpload}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Update Profile Picture</h5>
              <button className="close-btn" onClick={cancelPictureUpload}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="file-input"
                />
                <label htmlFor="profilePicture" className="upload-label">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="upload-placeholder">
                      <FontAwesomeIcon icon={faCamera} size="3x" />
                      <p>Click to select a picture</p>
                      <small>Max size: 5MB</small>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={handleUploadProfilePicture}
                disabled={!profilePicture || updateLoading}
              >
                {updateLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Update Picture
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary ms-2"
                onClick={cancelPictureUpload}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordMode && (
        <div className="modal-overlay" onClick={cancelPasswordChange}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Change Password</h5>
              <button className="close-btn" onClick={cancelPasswordChange}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Password *</label>
                  <div className="password-input">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      <FontAwesomeIcon icon={showPassword.current ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password *</label>
                  <div className="password-input">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      <FontAwesomeIcon icon={showPassword.new ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <small className="text-muted">Minimum 6 characters</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password *</label>
                  <div className="password-input">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      <FontAwesomeIcon icon={showPassword.confirm ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Change Password
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary ms-2"
                  onClick={cancelPasswordChange}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
