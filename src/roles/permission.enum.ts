export const FOLDER_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  SHARE: 'share',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  MOVE: 'move',
  COPY: 'copy',
  RENAME: 'rename',
  CHANGE_PERMISSIONS: 'changePermissions',
};

export const FOLDER_PERMISSIONS = {
  OWNER: 'owner',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export const FOLDER_PERMISSIONS_ACTIONS = {
  [FOLDER_PERMISSIONS.OWNER]: [
    FOLDER_ACTIONS.CREATE,
    FOLDER_ACTIONS.READ,
    FOLDER_ACTIONS.UPDATE,
    FOLDER_ACTIONS.DELETE,
    FOLDER_ACTIONS.SHARE,
    FOLDER_ACTIONS.DOWNLOAD,
    FOLDER_ACTIONS.UPLOAD,
    FOLDER_ACTIONS.MOVE,
    FOLDER_ACTIONS.COPY,
    FOLDER_ACTIONS.RENAME,
    FOLDER_ACTIONS.CHANGE_PERMISSIONS,
  ],
  [FOLDER_PERMISSIONS.ADMIN]: [
    FOLDER_ACTIONS.CREATE,
    FOLDER_ACTIONS.READ,
    FOLDER_ACTIONS.UPDATE,
    FOLDER_ACTIONS.DELETE,
    FOLDER_ACTIONS.SHARE,
    FOLDER_ACTIONS.DOWNLOAD,
    FOLDER_ACTIONS.UPLOAD,
    FOLDER_ACTIONS.MOVE,
    FOLDER_ACTIONS.COPY,
    FOLDER_ACTIONS.RENAME,
    FOLDER_ACTIONS.CHANGE_PERMISSIONS,
  ],
  [FOLDER_PERMISSIONS.USER]: [
    FOLDER_ACTIONS.CREATE,
    FOLDER_ACTIONS.READ,
    FOLDER_ACTIONS.UPDATE,
    FOLDER_ACTIONS.DELETE,
    FOLDER_ACTIONS.SHARE,
    FOLDER_ACTIONS.DOWNLOAD,
    FOLDER_ACTIONS.UPLOAD,
  ],
  [FOLDER_PERMISSIONS.GUEST]: [FOLDER_ACTIONS.READ, FOLDER_ACTIONS.DOWNLOAD],
};