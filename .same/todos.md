# WebRTC Camera/Mic Fixes

## Completed Fixes

- [x] **Fix `createPeerConnection` return type** - Was returning `peer` instead of `PeerConnection` object, breaking `handleOffer`
- [x] **Fix `handleOffer`** - Simplified to use the corrected `createPeerConnection` return value
- [x] **Fix useEffect dependencies** - Separated camera/mic effect from remoteUsers effect to avoid unnecessary reconnections
- [x] **Add `remoteUsersRef`** - Use ref to access current remoteUsers in camera/mic effect without causing re-renders
- [x] **Fix `handleUserLeft`** - Now uses `userId` (socket id) instead of `nickname` for proper peer removal

## Summary of Issues Found

1. `createPeerConnection` returned the SimplePeer instance instead of PeerConnection object
2. `handleOffer` created a redundant connection object wrapper
3. Camera/mic useEffect had `remoteUsers` in dependencies, causing stream recreation on user join/leave
4. `handleUserLeft` searched by nickname but peers are keyed by socket id
