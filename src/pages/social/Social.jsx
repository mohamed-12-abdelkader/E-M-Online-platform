import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Avatar,
  Button,
  Textarea,
  Input,
  Image,
  IconButton,
  HStack,
  VStack,
  Divider,
  Select,
  useToast,
  Spinner,
  useColorModeValue,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { FiThumbsUp, FiHeart } from 'react-icons/fi'
import { IoAttachOutline, IoClose, IoChatbubbleOutline, IoShareSocialOutline, IoImageOutline, IoVideocamOutline, IoHappyOutline, IoEarthOutline, IoLockClosedOutline, IoPeopleOutline, IoEllipsisVertical } from 'react-icons/io5'
import { BiSupport } from 'react-icons/bi'
import dayjs from 'dayjs'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'
import { io } from 'socket.io-client'

const ReactionBar = ({ myReaction, onReact, isSubmitting }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.300')
  const activeColor = 'teal.500'
  return (
    <HStack spacing={1}>
      <Button leftIcon={<FiThumbsUp />} size='sm' variant='ghost' color={myReaction === 'like' ? activeColor : iconColor} onClick={() => onReact('like')} isDisabled={isSubmitting}>إعجاب</Button>
      <Button leftIcon={<FiHeart />} size='sm' variant='ghost' color={myReaction === 'love' ? activeColor : iconColor} onClick={() => onReact('love')} isDisabled={isSubmitting}>أحببته</Button>
      <Button leftIcon={<BiSupport />} size='sm' variant='ghost' color={myReaction === 'support' ? activeColor : iconColor} onClick={() => onReact('support')} isDisabled={isSubmitting}>دعم</Button>
    </HStack>
  )
}

const Media = ({ url, type }) => {
  if (!url) return null
  if (type === 'image') return <Image src={url} alt='media' borderRadius='md' maxH='400px' objectFit='cover' />
  if (type === 'video') return (
    <Box as='video' src={url} controls borderRadius='md' maxH='400px' />
  )
  return (
    <a href={url} target='_blank' rel='noreferrer'>
      <Text color='teal.500' textDecoration='underline'>ملف مرفق</Text>
    </a>
  )
}

const CommentItem = ({ comment, onReplySelect, onReact, reacting, onUpdateComment, onDeleteComment }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  return (
    <Box border='1px solid' borderColor={borderColor} borderRadius='md' p={3} mb={2} bg={useColorModeValue('white', 'gray.800')}>
      <HStack spacing={3} align='start'>
        <Avatar size='sm' name={comment.author_name} />
        <Box flex='1'>
          <HStack justify='space-between' align='start'>
            <Text fontWeight='bold' fontSize='sm'>{comment.author_name}</Text>
            <Text fontSize='xs' color={useColorModeValue('gray.500','gray.400')}>{dayjs(comment.created_at).fromNow?.() || dayjs(comment.created_at).format('YYYY/MM/DD HH:mm')}</Text>
          </HStack>
          <Text mt={1} fontSize='sm'>{comment.content}</Text>
          {comment.media_url && <Box mt={2}><Media url={comment.media_url} type={comment.media_type} /></Box>}
          <HStack mt={2} spacing={3}>
            <Button variant='link' color='teal.500' size='xs' onClick={() => onReplySelect(comment)}>رد</Button>
            <ReactionBar myReaction={comment.myReaction} onReact={(r) => onReact(comment.id, r, 'comment')} isSubmitting={reacting === comment.id} />
            <Menu>
              <MenuButton as={IconButton} aria-label='خيارات التعليق' icon={<IoEllipsisVertical />} size='xs' variant='ghost' />
              <MenuList>
                <MenuItem onClick={() => setEditComment({ id: comment.id, postId: comment.post_id, content: comment.content || '' })}>تعديل</MenuItem>
                <MenuItem color='red.500' onClick={() => setDeleteComment({ id: comment.id, postId: comment.post_id })}>حذف</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>
      </HStack>
      {comment.replies && comment.replies.length > 0 && (
        <Box mt={3} pl={6}>
          {comment.replies.map((child) => (
            <CommentItem key={child.id} comment={child} onReplySelect={onReplySelect} onReact={onReact} reacting={reacting} />
          ))}
        </Box>
      )}
    </Box>
  )
}

const Social = () => {
  const toast = useToast()
  const [userData] = UserType()
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [posts, setPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [composer, setComposer] = useState({ content: '', visibility: 'public' })
  const [pendingMedia, setPendingMedia] = useState([]) // [{ file, previewUrl, kind }]
  const fileInputRef = useRef(null)
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentsOpen, setCommentsOpen] = useState({})
  const [activeCommentsPost, setActiveCommentsPost] = useState(null)
  const [reactingTarget, setReactingTarget] = useState(null)
  const [replyTargetByPost, setReplyTargetByPost] = useState({})
  const [modalCommentText, setModalCommentText] = useState('')
  const [editPost, setEditPost] = useState(null) // { id, content, visibility }
  const [deletePostId, setDeletePostId] = useState(null)
  const [editPostDraft, setEditPostDraft] = useState({ content: '', visibility: 'public' })
  const [editComment, setEditComment] = useState(null) // { id, postId, content }
  const [deleteComment, setDeleteComment] = useState(null) // { id, postId }
  const [editCommentDraft, setEditCommentDraft] = useState('')

  const authHeader = useMemo(() => {
    const raw = localStorage.getItem('Authorization') || localStorage.getItem('token')
    if (!raw) return undefined
    return /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`
  }, [])

  const loadPosts = async (before) => {
    const params = new URLSearchParams()
    params.set('limit', '20')
    if (before) params.set('before', before)
    const { data } = await baseUrl.get(`/api/social/posts?${params.toString()}`, { headers: authHeader ? { Authorization: authHeader } : {} })
    return data?.posts || []
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const initial = await loadPosts()
        setPosts(initial)
        setHasMore(initial.length === 20)
      } catch {
        toast({ title: 'فشل تحميل المنشورات', status: 'error', duration: 2500, isClosable: true })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [authHeader, toast])

  const handleLoadMore = async () => {
    if (!hasMore || posts.length === 0) return
    try {
      setLoadingMore(true)
      const before = posts[posts.length - 1]?.created_at
      const more = await loadPosts(before)
      setPosts(prev => [...prev, ...more])
      setHasMore(more.length === 20)
    } catch {
      toast({ title: 'فشل تحميل المزيد', status: 'error', duration: 2500, isClosable: true })
    } finally {
      setLoadingMore(false)
    }
  }

  const handleCreatePost = async () => {
    if (!composer.content.trim() && pendingMedia.length === 0) return
    try {
      setCreating(true)
      const form = new FormData()
      if (composer.content?.trim()) form.append('content', composer.content.trim())
      if (composer.visibility) form.append('visibility', composer.visibility)
      pendingMedia.slice(0, 10).forEach(pm => form.append('media', pm.file))
      const { data } = await baseUrl.post('/api/social/posts', form, { headers: authHeader ? { Authorization: authHeader } : {} })
      const newPost = data?.post
      if (newPost) {
        setPosts(prev => [newPost, ...prev])
        setComposer({ content: '', visibility: 'public' })
        pendingMedia.forEach(pm => { if (pm.previewUrl) URL.revokeObjectURL(pm.previewUrl) })
        setPendingMedia([])
      }
    } catch {
      toast({ title: 'تعذر إنشاء المنشور', status: 'error', duration: 2500, isClosable: true })
    } finally {
      setCreating(false)
    }
  }

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const next = files.map(file => {
      let kind = 'file'
      if (file.type.startsWith('image/')) kind = 'image'
      else if (file.type.startsWith('video/')) kind = 'video'
      const previewUrl = kind === 'image' ? URL.createObjectURL(file) : null
      return { file, previewUrl, kind }
    })
    setPendingMedia(prev => [...prev, ...next].slice(0, 10))
    e.target.value = ''
  }

  // Realtime socket
  useEffect(() => {
    const token = (localStorage.getItem('Authorization') || '').replace(/^Bearer\s+/i, '') || localStorage.getItem('token')
    let origin
    try { origin = new URL(baseUrl.defaults.baseURL || window.location.origin).origin } catch { origin = window.location.origin }
    const socket = io(origin, { path: '/socket.io', withCredentials: true, auth: token ? { token } : {}, transports: ['websocket'] })

    socket.on('social:post-created', ({ post }) => {
      if (post) setPosts(prev => [post, ...prev])
    })

    socket.on('social:comment-created', ({ post_id, comment }) => {
      if (!post_id || !comment) return
      setPosts(prev => prev.map(p => p.id === post_id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p))
      setCommentsByPost(prev => {
        if (!prev[post_id]) return prev
        const existing = JSON.parse(JSON.stringify(prev[post_id]))
        const node = { ...comment, replies: [] }
        if (comment.parent_comment_id) {
          const attach = (arr) => {
            for (const c of arr) {
              if (c.id === comment.parent_comment_id) { c.replies.push(node); return true }
              if (attach(c.replies || [])) return true
            }
            return false
          }
          if (!attach(existing)) existing.unshift(node)
        } else {
          existing.unshift(node)
        }
        return { ...prev, [post_id]: existing }
      })
    })

    return () => { socket.disconnect() }
  }, [])

  useEffect(() => {
    if (editPost) setEditPostDraft({ content: editPost.content || '', visibility: editPost.visibility || 'public' })
  }, [editPost])

  useEffect(() => {
    if (editComment) setEditCommentDraft(editComment.content || '')
  }, [editComment])

  const toggleComments = async (postId) => {
    setActiveCommentsPost(postId)
    setCommentsOpen(prev => ({ ...prev, [postId]: true }))
    if (!commentsByPost[postId]) {
      try {
        const { data } = await baseUrl.get(`/api/social/posts/${postId}/comments`, { headers: authHeader ? { Authorization: authHeader } : {} })
        const comments = (data?.comments || [])
        // Build tree from parent_comment_id
        const byId = new Map(comments.map(c => [c.id, { ...c, replies: [] }]))
        const roots = []
        byId.forEach((c) => {
          if (c.parent_comment_id) {
            const parent = byId.get(c.parent_comment_id)
            if (parent) parent.replies.push(c)
            else roots.push(c)
          } else {
            roots.push(c)
          }
        })
        setCommentsByPost(prev => ({ ...prev, [postId]: roots }))
      } catch {
        toast({ title: 'فشل تحميل التعليقات', status: 'error', duration: 2500, isClosable: true })
      }
    }
  }

  const handleAddComment = async (postId, content, parentComment) => {
    if (!content.trim()) return
    try {
      const body = { content, media_url: null, media_type: null, parent_comment_id: parentComment?.id || null }
      const { data } = await baseUrl.post(`/api/social/posts/${postId}/comments`, body, { headers: authHeader ? { Authorization: authHeader } : {} })
      const newComment = data?.comment
      if (newComment) {
        setCommentsByPost(prev => {
          const existing = prev[postId] ? JSON.parse(JSON.stringify(prev[postId])) : []
          const node = { ...newComment, replies: [] }
          if (parentComment) {
            const attach = (arr) => {
              for (const c of arr) {
                if (c.id === parentComment.id) { c.replies.unshift(node); return true }
                if (attach(c.replies)) return true
              }
              return false
            }
            if (!attach(existing)) existing.unshift(node)
          } else {
            existing.unshift(node)
          }
          return { ...prev, [postId]: existing }
        })
        setReplyTargetByPost(prev => ({ ...prev, [postId]: null }))
      }
    } catch {
      toast({ title: 'تعذر إضافة التعليق', status: 'error', duration: 2500, isClosable: true })
    }
  }

  const handleReact = async (targetId, reaction, targetType) => {
    try {
      setReactingTarget(targetId)
      const body = targetType === 'comment' ? { comment_id: targetId, reaction } : { post_id: targetId, reaction }
      await baseUrl.post('/api/social/reactions', body, { headers: authHeader ? { Authorization: authHeader } : {} })
      if (targetType === 'comment') {
        setCommentsByPost(prev => {
          const next = { ...prev }
          Object.keys(next).forEach(pid => {
            const update = (arr) => arr.map(c => ({ ...c, myReaction: c.id === targetId ? reaction : c.myReaction, replies: update(c.replies || []) }))
            next[pid] = update(next[pid] || [])
          })
          return next
        })
      } else {
        setPosts(prev => prev.map(p => {
          if (p.id !== targetId) return p
          const next = { ...p, myReaction: reaction }
          // عدّل العدادات محلياً: قلل القديم وزود الجديد
          const dec = (k) => Math.max(0, (next[k] || 0) - 1)
          const inc = (k) => (next[k] || 0) + 1
          if (p.myReaction && p.myReaction !== reaction) {
            if (p.myReaction === 'like') next.likes = dec('likes')
            if (p.myReaction === 'love') next.loves = dec('loves')
            if (p.myReaction === 'support') next.supports = dec('supports')
          }
          if (reaction === 'like') next.likes = inc('likes')
          if (reaction === 'love') next.loves = inc('loves')
          if (reaction === 'support') next.supports = inc('supports')
          return next
        }))
      }
    } catch {
      toast({ title: 'تعذر تنفيذ التفاعل', status: 'error', duration: 2500, isClosable: true })
    } finally {
      setReactingTarget(null)
    }
  }

  const PostCard = ({ post }) => {
    const [commentText, setCommentText] = useState('')
    const replyTarget = replyTargetByPost[post.id]
    const borderColor = useColorModeValue('gray.200', 'gray.700')
    const cardBg = useColorModeValue('white', 'gray.800')

    return (
      <Box border='1px solid' borderColor={borderColor} borderRadius='2xl' bg={cardBg} p={5} mb={6} boxShadow={useColorModeValue('sm','dark-lg')} _hover={{ borderColor: useColorModeValue('gray.300','gray.600') }} transition='border-color 0.15s ease'>
        <HStack spacing={4} align='start'>
          <Avatar name={post.author_name} />
          <Box flex='1'>
            <HStack justify='space-between' align='start'>
              <HStack spacing={2}>
                <Text fontWeight='bold'>{post.author_name}</Text>
                {post.visibility && <Tag size='sm' colorScheme='teal' variant='subtle'>{post.visibility}</Tag>}
              </HStack>
              <HStack>
                <Text fontSize='sm' color={useColorModeValue('gray.500','gray.400')}>{dayjs(post.created_at).fromNow?.() || dayjs(post.created_at).format('YYYY/MM/DD HH:mm')}</Text>
                {/* Actions menu */}
                <Menu>
                  <MenuButton as={IconButton} aria-label='خيارات' icon={<IoEllipsisVertical />} size='sm' variant='ghost' />
                  <MenuList>
                    <MenuItem onClick={() => setEditPost({ id: post.id, content: post.content || '', visibility: post.visibility || 'public' })}>تعديل</MenuItem>
                    <MenuItem color='red.500' onClick={() => setDeletePostId(post.id)}>حذف</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>
            {post.content && (
              <Text mt={2} lineHeight='tall' fontSize='md'>
                {post.content}
              </Text>
            )}
            {post.media_url && (
              <Box mt={3} overflow='hidden' borderRadius='lg'>
                <Media url={post.media_url} type={post.media_type} />
              </Box>
            )}
            {Array.isArray(post.media_list) && post.media_list.length > 0 && (
              <SimpleGrid mt={3} columns={{ base: 2, md: Math.min(3, post.media_list.length) }} spacing={2}>
                {post.media_list.map((m) => (
                  <Box key={m.id || m.url} overflow='hidden' borderRadius='md'>
                    <Media url={m.url} type={m.type} />
                  </Box>
                ))}
              </SimpleGrid>
            )}

            {/* Counts row */}
            <HStack mt={4} justify='space-between' color={useColorModeValue('gray.600','gray.400')} fontSize='sm'>
              <HStack spacing={3}>
                {(post.likes || 0) > 0 && (
                  <HStack spacing={1}><FiThumbsUp /> <Text>{post.likes}</Text></HStack>
                )}
                {(post.loves || 0) > 0 && (
                  <HStack spacing={1}><FiHeart /> <Text>{post.loves}</Text></HStack>
                )}
                {(post.supports || 0) > 0 && (
                  <HStack spacing={1}><BiSupport /> <Text>{post.supports}</Text></HStack>
                )}
              </HStack>
              <HStack spacing={1}><IoChatbubbleOutline /> <Text>{post.comments_count || 0}</Text></HStack>
            </HStack>

            <HStack mt={2} spacing={1} justify='space-between' borderTop='1px solid' borderColor={useColorModeValue('gray.200','gray.700')} pt={2}>
              <ReactionBar myReaction={post.myReaction} onReact={(r) => handleReact(post.id, r, 'post')} isSubmitting={reactingTarget === post.id} />
              <HStack spacing={1}>
                <Button leftIcon={<IoChatbubbleOutline />} size='sm' variant='ghost' onClick={() => toggleComments(post.id)} _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}>تعليق</Button>
                <Button leftIcon={<IoShareSocialOutline />} size='sm' variant='ghost' _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}>مشاركة</Button>
              </HStack>
            </HStack>

            {/* التعليقات تُعرض بالمودال عند اختيار "تعليق" */}
          </Box>
        </HStack>
      </Box>
    )
  }

  const pageBg = useColorModeValue('gray.100', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box minH='100vh' bg={pageBg} pt='80px'>
      <Flex maxW='800px' mx='auto' direction='column' px={{ base: 3, md: 0 }}>
        {/* Composer */}
        <Box border='1px solid' borderColor={borderColor} borderRadius='2xl' bg={cardBg} p={5} mb={6} boxShadow={useColorModeValue('sm','dark-lg')} _hover={{ borderColor: useColorModeValue('gray.300','gray.600') }} transition='border-color 0.15s ease'>
          <HStack align='start' spacing={3}>
            <Avatar name={userData?.name} />
            <Box flex='1'>
              <Textarea placeholder='اكتب منشوراً عاماً...' value={composer.content} onChange={(e) => setComposer(prev => ({ ...prev, content: e.target.value }))} mb={3} bg={useColorModeValue('gray.50','gray.700')} _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }} borderRadius='lg' />
              {/* Media preview */}
              {pendingMedia.length > 0 && (
                <SimpleGrid columns={{ base: 2, md: Math.min(3, pendingMedia.length) }} spacing={2} mb={3}>
                  {pendingMedia.map((pm, idx) => (
                    <Flex key={idx} align='center' border='1px solid' borderColor={borderColor} p={2} borderRadius='md' bg={useColorModeValue('gray.50','gray.700')}>
                      {pm.kind === 'image' ? (
                        <Image src={pm.previewUrl} alt='preview' boxSize='60px' objectFit='cover' borderRadius='md' mr={3} />
                      ) : (
                        <Text fontSize='sm' mr={3}>ملف: {pm.file.name}</Text>
                      )}
                      <IconButton aria-label='إزالة' icon={<IoClose />} size='sm' variant='ghost' onClick={() => {
                        if (pm.previewUrl) URL.revokeObjectURL(pm.previewUrl)
                        setPendingMedia(prev => prev.filter((_, i) => i !== idx))
                      }} />
                    </Flex>
                  ))}
                </SimpleGrid>
              )}
              <HStack justify='space-between'>
                <HStack>
                  <Button leftIcon={<IoImageOutline />} variant='ghost' onClick={handlePickFile}>صورة/ملف</Button>
                  <Button leftIcon={<IoVideocamOutline />} variant='ghost' onClick={handlePickFile}>فيديو</Button>
                  <Button leftIcon={<IoHappyOutline />} variant='ghost'>شعور/نشاط</Button>
                </HStack>
                <Select w='240px' value={composer.visibility} onChange={(e) => setComposer(prev => ({ ...prev, visibility: e.target.value }))} bg={useColorModeValue('gray.50','gray.700')} _focus={{ borderColor: 'teal.400' }} borderRadius='md'>
                  <option value='public'>عام</option>
                  <option value='grades'>الصفوف</option>
                  <option value='teachers'>المعلمين</option>
                  <option value='students'>الطلاب</option>
                </Select>
                <Button colorScheme='teal' onClick={handleCreatePost} isLoading={creating} isDisabled={!composer.content.trim() && !pendingMedia}>نشر</Button>
              </HStack>
              <input ref={fileInputRef} type='file' style={{ display: 'none' }} onChange={handleFileChange} multiple accept='image/*,video/*,application/pdf,application/*,text/*' />
            </Box>
          </HStack>
        </Box>

        {/* Feed */}
        {loading ? (
          <Flex align='center' justify='center' py={16}><Spinner color='teal.500' /></Flex>
        ) : posts.length === 0 ? (
          <Text textAlign='center' color={useColorModeValue('gray.600','gray.400')}>لا توجد منشورات بعد</Text>
        ) : (
          <>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
            {hasMore && (
              <Flex align='center' justify='center' py={6}>
                <Button onClick={handleLoadMore} isLoading={loadingMore} variant='outline'>عرض المزيد</Button>
              </Flex>
            )}
          </>
        )}
      </Flex>

      {/* Comments Modal */}
      {activeCommentsPost && (
        <Modal isOpen={!!activeCommentsPost} onClose={() => setActiveCommentsPost(null)} size='xl' scrollBehavior='inside'>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>التعليقات</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                {/* Reply bar */}
                {replyTargetByPost[activeCommentsPost] && (
                  <Flex bg={useColorModeValue('green.50','green.900')} borderLeft='4px solid' borderColor='green.400' p={2} borderRadius='md' mb={2} align='center'>
                    <Box flex='1'>
                      <Text fontSize='xs' fontWeight='bold'>{replyTargetByPost[activeCommentsPost]?.author_name}</Text>
                      <Text fontSize='xs' noOfLines={2}>{replyTargetByPost[activeCommentsPost]?.content}</Text>
                    </Box>
                    <Button size='xs' variant='ghost' onClick={() => setReplyTargetByPost(prev => ({ ...prev, [activeCommentsPost]: null }))}>إلغاء</Button>
                  </Flex>
                )}

                <HStack align='start'>
                  <Avatar size='sm' name={userData?.name} />
                  <Textarea placeholder='اكتب تعليقك...' value={''} onChange={() => {}} display='none' />
                </HStack>
                <VStack align='stretch' spacing={2}>
                  {(commentsByPost[activeCommentsPost] || []).map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      onReplySelect={(cm) => setReplyTargetByPost(prev => ({ ...prev, [activeCommentsPost]: cm }))}
                      onReact={(id, r) => handleReact(id, r, 'comment')}
                      reacting={reactingTarget}
                      onUpdateComment={(id, newContent) => {
                        setCommentsByPost(prev => {
                          const clone = JSON.parse(JSON.stringify(prev))
                          const update = (arr) => arr.map(cc => cc.id === id ? { ...cc, content: newContent } : { ...cc, replies: update(cc.replies || []) })
                          clone[activeCommentsPost] = update(clone[activeCommentsPost] || [])
                          return clone
                        })
                      }}
                      onDeleteComment={(id) => {
                        setCommentsByPost(prev => {
                          const clone = JSON.parse(JSON.stringify(prev))
                          const remove = (arr) => arr.filter(cc => cc.id !== id).map(cc => ({ ...cc, replies: remove(cc.replies || []) }))
                          clone[activeCommentsPost] = remove(clone[activeCommentsPost] || [])
                          return clone
                        })
                      }}
                    />
                  ))}
                </VStack>
              </Box>
            </ModalBody>
            <ModalFooter>
              <HStack w='full'>
                <Avatar size='sm' name={userData?.name} />
                <Textarea placeholder='اكتب تعليقك...' value={''} onChange={() => {}} display='none' />
                <Textarea placeholder='اكتب تعليقك...' flex='1' bg={useColorModeValue('gray.50','gray.700')} _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }} borderRadius='lg' resize='vertical' minH='44px' onChange={(e) => { /* use local state */ }} id='modal-comment-input' />
                <Button colorScheme='teal' onClick={() => {
                  const input = document.getElementById('modal-comment-input')
                  const content = input?.value || ''
                  if (!content.trim()) return
                  handleAddComment(activeCommentsPost, content, replyTargetByPost[activeCommentsPost])
                  if (input) input.value = ''
                }}>إرسال</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <Modal isOpen={!!editPost} onClose={() => setEditPost(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تعديل المنشور</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align='stretch' spacing={3}>
                <Textarea value={editPostDraft.content} onChange={(e) => setEditPostDraft(prev => ({ ...prev, content: e.target.value }))} />
                <Select value={editPostDraft.visibility} onChange={(e) => setEditPostDraft(prev => ({ ...prev, visibility: e.target.value }))}>
                  <option value='public'>عام</option>
                  <option value='grades'>الصفوف</option>
                  <option value='teachers'>المعلمين</option>
                  <option value='students'>الطلاب</option>
                </Select>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={() => setEditPost(null)}>إلغاء</Button>
              <Button colorScheme='teal' onClick={async () => {
                try {
                  const { data } = await baseUrl.put(`/api/social/posts/${editPost.id}`, { content: editPostDraft.content, visibility: editPostDraft.visibility }, { headers: authHeader ? { Authorization: authHeader } : {} })
                  const updated = data?.post || { id: editPost.id, content: editPostDraft.content, visibility: editPostDraft.visibility }
                  setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, content: updated.content, visibility: updated.visibility } : p))
                  setEditPost(null)
                } catch {
                  toast({ title: 'تعذر تعديل المنشور', status: 'error', duration: 2500, isClosable: true })
                }
              }}>حفظ</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Post Confirm */}
      {deletePostId && (
        <Modal isOpen={!!deletePostId} onClose={() => setDeletePostId(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تأكيد الحذف</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>هل تريد حذف هذا المنشور؟</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={() => setDeletePostId(null)}>إلغاء</Button>
              <Button colorScheme='red' onClick={async () => {
                try {
                  await baseUrl.delete(`/api/social/posts/${deletePostId}`, { headers: authHeader ? { Authorization: authHeader } : {} })
                  setPosts(prev => prev.filter(p => p.id !== deletePostId))
                  setDeletePostId(null)
                } catch {
                  toast({ title: 'تعذر حذف المنشور', status: 'error', duration: 2500, isClosable: true })
                }
              }}>حذف</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Comment Modal */}
      {editComment && (
        <Modal isOpen={!!editComment} onClose={() => setEditComment(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تعديل التعليق</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea value={editCommentDraft} onChange={(e) => setEditCommentDraft(e.target.value)} />
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={() => setEditComment(null)}>إلغاء</Button>
              <Button colorScheme='teal' onClick={async () => {
                try {
                  const { data } = await baseUrl.put(`/api/social/comments/${editComment.id}`, { content: editCommentDraft }, { headers: authHeader ? { Authorization: authHeader } : {} })
                  const updated = data?.comment || { id: editComment.id, content: editCommentDraft }
                  // update in tree
                  setCommentsByPost(prev => {
                    const clone = JSON.parse(JSON.stringify(prev))
                    const update = (arr) => arr.map(cc => cc.id === updated.id ? { ...cc, content: updated.content } : { ...cc, replies: update(cc.replies || []) })
                    clone[editComment.postId] = update(clone[editComment.postId] || [])
                    return clone
                  })
                  setEditComment(null)
                } catch {
                  toast({ title: 'تعذر تعديل التعليق', status: 'error', duration: 2500, isClosable: true })
                }
              }}>حفظ</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Comment Confirm */}
      {deleteComment && (
        <Modal isOpen={!!deleteComment} onClose={() => setDeleteComment(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تأكيد الحذف</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>هل تريد حذف هذا التعليق؟</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={() => setDeleteComment(null)}>إلغاء</Button>
              <Button colorScheme='red' onClick={async () => {
                try {
                  await baseUrl.delete(`/api/social/comments/${deleteComment.id}`, { headers: authHeader ? { Authorization: authHeader } : {} })
                  setCommentsByPost(prev => {
                    const clone = JSON.parse(JSON.stringify(prev))
                    const remove = (arr) => arr.filter(cc => cc.id !== deleteComment.id).map(cc => ({ ...cc, replies: remove(cc.replies || []) }))
                    clone[deleteComment.postId] = remove(clone[deleteComment.postId] || [])
                    return clone
                  })
                  setDeleteComment(null)
                } catch {
                  toast({ title: 'تعذر حذف التعليق', status: 'error', duration: 2500, isClosable: true })
                }
              }}>حذف</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  )
}

export default Social