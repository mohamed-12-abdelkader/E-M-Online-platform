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
import { IoAttachOutline, IoClose, IoChatbubbleOutline, IoShareSocialOutline, IoImageOutline, IoVideocamOutline, IoHappyOutline, IoEarthOutline, IoLockClosedOutline, IoPeopleOutline, IoEllipsisVertical, IoChevronBack, IoChevronForward, IoDownloadOutline } from 'react-icons/io5'
import { BiSupport } from 'react-icons/bi'
import dayjs from 'dayjs'
import baseUrl from '../../api/baseUrl'
import UserType from '../../Hooks/auth/userType'
import { io } from 'socket.io-client'
import img from "../../../public/Picsart_25-08-26_23-28-39-014.png"
const ReactionBar = ({ myReaction, onReact, isSubmitting }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.300')
  const activeColor = 'teal.500'
  return (
    <HStack spacing={{ base: 0.5, sm: 1 }} flexWrap='wrap'>
      <Button 
        leftIcon={<FiThumbsUp />} 
        size={{ base: 'xs', sm: 'sm' }} 
        variant='ghost' 
        color={myReaction === 'like' ? activeColor : iconColor} 
        onClick={() => onReact('like')} 
        isDisabled={isSubmitting}
        fontSize={{ base: 'xs', sm: 'sm' }}
        px={{ base: 2, sm: 3 }}
      >
        <Text display={{ base: 'none', sm: 'inline' }}>إعجاب</Text>
        <Text display={{ base: 'inline', sm: 'none' }}>👍</Text>
      </Button>
      <Button 
        leftIcon={<FiHeart />} 
        size={{ base: 'xs', sm: 'sm' }} 
        variant='ghost' 
        color={myReaction === 'love' ? activeColor : iconColor} 
        onClick={() => onReact('love')} 
        isDisabled={isSubmitting}
        fontSize={{ base: 'xs', sm: 'sm' }}
        px={{ base: 2, sm: 3 }}
      >
        <Text display={{ base: 'none', sm: 'inline' }}>أحببته</Text>
        <Text display={{ base: 'inline', sm: 'none' }}>❤️</Text>
      </Button>
      <Button 
        leftIcon={<BiSupport />} 
        size={{ base: 'xs', sm: 'sm' }} 
        variant='ghost' 
        color={myReaction === 'support' ? activeColor : iconColor} 
        onClick={() => onReact('support')} 
        isDisabled={isSubmitting}
        fontSize={{ base: 'xs', sm: 'sm' }}
        px={{ base: 2, sm: 3 }}
      >
        <Text display={{ base: 'none', sm: 'inline' }}>دعم</Text>
        <Text display={{ base: 'inline', sm: 'none' }}>🤝</Text>
      </Button>
    </HStack>
  )
}

const Media = ({ url, type, onImageClick }) => {
  if (!url) return null
  if (type === 'image') return <Image src={url} alt='media' borderRadius='md' maxH='400px' objectFit='cover' cursor={onImageClick ? 'zoom-in' : 'default'} onClick={onImageClick} />
  if (type === 'video') return (
    <Box as='video' src={url} controls borderRadius='md' maxH='400px' />
  )
  return (
    <a href={url} target='_blank' rel='noreferrer'>
      <Text color='teal.500' textDecoration='underline'>ملف مرفق</Text>
    </a>
  )
}

const CommentItem = ({ comment, onReplySelect, onReact, reacting, onUpdateComment, onDeleteComment, onOpenImage }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  return (
    <Box 
      border='1px solid' 
      borderColor={borderColor} 
      borderRadius='md' 
      p={{ base: 2, sm: 3 }} 
      mb={2} 
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Flex direction={{ base: 'column', sm: 'row' }} align='start' spacing={{ base: 2, sm: 3 }}>
        <Avatar 
         className='mx-2 border-2 border-gray-300'
          size={{ base: 'xs', sm: 'sm' }} 
          name={comment.author_name}
          src={comment.author_name === 'EM Academy' 
            ? img
            : comment.author_avatar
          }
        />
        <Box flex='1' w='full'>
          <Flex 
            direction={{ base: 'column', sm: 'row' }} 
            justify='space-between' 
            align={{ base: 'start', sm: 'start' }}
            gap={1}
          >
            <Text fontWeight='bold' fontSize={{ base: 'xs', sm: 'sm' }}>{comment.author_name}</Text>
            <Text 
              fontSize={{ base: 'xs', sm: 'xs' }} 
              color={useColorModeValue('gray.500','gray.400')}
              textAlign={{ base: 'left', sm: 'right' }}
            >
              {dayjs(comment.created_at).fromNow?.() || dayjs(comment.created_at).format('YYYY/MM/DD HH:mm')}
            </Text>
          </Flex>
          <Text 
            mt={1} 
            fontSize={{ base: 'xs', sm: 'sm' }}
            wordBreak='break-word'
            whiteSpace='pre-wrap'
          >
            {comment.content}
          </Text>
          {comment.media_url && (
            <Box mt={2}>
              <Media url={comment.media_url} type={comment.media_type} onImageClick={comment.media_type === 'image' ? () => onOpenImage?.([comment.media_url], 0) : undefined} />
            </Box>
          )}
          <Flex 
            mt={2} 
            direction={{ base: 'column', sm: 'row' }}
            justify='space-between'
            align={{ base: 'stretch', sm: 'center' }}
            gap={2}
          >
            <HStack spacing={{ base: 1, sm: 3 }} flexWrap='wrap'>
              <Button 
                variant='link' 
                color='teal.500' 
                size={{ base: 'xs', sm: 'xs' }} 
                onClick={() => onReplySelect(comment)}
                fontSize={{ base: 'xs', sm: 'xs' }}
                px={1}
              >
                رد
              </Button>
              <ReactionBar 
                myReaction={comment.myReaction} 
                onReact={(r) => onReact(comment.id, r, 'comment')} 
                isSubmitting={reacting === comment.id} 
              />
            </HStack>
            <Menu>
              <MenuButton 
                as={IconButton} 
                aria-label='خيارات التعليق' 
                icon={<IoEllipsisVertical />} 
                size={{ base: 'xs', sm: 'xs' }} 
                variant='ghost' 
              />
              <MenuList>
                <MenuItem 
                  onClick={() => setEditComment({ id: comment.id, postId: comment.post_id, content: comment.content || '' })}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                >
                  تعديل
                </MenuItem>
                <MenuItem 
                  color='red.500' 
                  onClick={() => setDeleteComment({ id: comment.id, postId: comment.post_id })}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                >
                  حذف
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Box>
      </Flex>
      {comment.replies && comment.replies.length > 0 && (
        <Box mt={3} pl={{ base: 4, sm: 6 }}>
          {comment.replies.map((child) => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              onReplySelect={onReplySelect} 
              onReact={onReact} 
              reacting={reacting}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              onOpenImage={onOpenImage}
            />
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
  const [imageViewer, setImageViewer] = useState({ isOpen: false, urls: [], index: 0 })

  const openImageViewer = (urls, index = 0) => {
    if (!Array.isArray(urls) || urls.length === 0) return
    setImageViewer({ isOpen: true, urls, index: Math.max(0, Math.min(index, urls.length - 1)) })
  }
  const closeImageViewer = () => setImageViewer(prev => ({ ...prev, isOpen: false }))
  const showPrevImage = () => setImageViewer(prev => ({ ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length }))
  const showNextImage = () => setImageViewer(prev => ({ ...prev, index: (prev.index + 1) % prev.urls.length }))
  const downloadCurrentImage = () => {
    try {
      const url = imageViewer.urls[imageViewer.index]
      if (!url) return
      const link = document.createElement('a')
      link.href = url
      const name = `image-${Date.now()}.jpg`
      link.setAttribute('download', name)
      link.setAttribute('target', '_blank')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {}
  }

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
      <Box 
        border='1px solid' 
        borderColor={borderColor} 
        borderRadius={{ base: 'xl', md: '2xl' }} 
        bg={cardBg} 
        p={{ base: 3, sm: 4, md: 5 }} 
        mb={{ base: 4, md: 6 }} 
        boxShadow={useColorModeValue('sm','dark-lg')} 
        _hover={{ borderColor: useColorModeValue('gray.300','gray.600') }} 
        transition='border-color 0.15s ease'
      >
        <Flex direction={{ base: 'column', sm: 'row' }} align='start' spacing={{ base: 3, sm: 4 }}>
          <Avatar 
          className='mx-2 border-2 border-gray-300'
            name={post.author_name} 
            size={{ base: 'sm', md: 'md' }}
            src={post.author_name === 'EM Academy' 
              ? img
              : post.author_avatar
            }
          />
          <Box flex='1' w='full'>
            {/* Header */}
            <Flex 
              direction={{ base: 'column', sm: 'row' }} 
              justify='space-between' 
              align={{ base: 'start', sm: 'start' }}
              mb={2}
              gap={2}
            >
              <HStack spacing={2} align='start' flexWrap='wrap'>
                <Text fontWeight='bold' fontSize={{ base: 'sm', md: 'md' }}>{post.author_name}</Text>
                {post.visibility && (
                  <Tag 
                    size={{ base: 'xs', sm: 'sm' }} 
                    colorScheme='teal' 
                    variant='subtle'
                    fontSize={{ base: 'xs', sm: 'sm' }}
                  >
                    {post.visibility}
                  </Tag>
                )}
              </HStack>
              <HStack spacing={2} align='center'>
                <Text 
                  fontSize={{ base: 'xs', sm: 'sm' }} 
                  color={useColorModeValue('gray.500','gray.400')}
                  textAlign={{ base: 'left', sm: 'right' }}
                >
                  {dayjs(post.created_at).fromNow?.() || dayjs(post.created_at).format('YYYY/MM/DD HH:mm')}
                </Text>
                {/* Actions menu */}
                <Menu>
                  <MenuButton 
                    as={IconButton} 
                    aria-label='خيارات' 
                    icon={<IoEllipsisVertical />} 
                    size={{ base: 'xs', sm: 'sm' }} 
                    variant='ghost' 
                  />
                  <MenuList>
                    <MenuItem onClick={() => setEditPost({ id: post.id, content: post.content || '', visibility: post.visibility || 'public' })}>تعديل</MenuItem>
                    <MenuItem color='red.500' onClick={() => setDeletePostId(post.id)}>حذف</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>

            {/* Content */}
            {post.content && (
              <Text 
                mt={2} 
                lineHeight='tall' 
                fontSize={{ base: 'sm', md: 'md' }}
                wordBreak='break-word'
                whiteSpace='pre-wrap'
              >
                {post.content}
              </Text>
            )}

            {/* Media */}
            {post.media_url && (
              <Box mt={3} overflow='hidden' borderRadius='lg'>
                <Media 
                  url={post.media_url} 
                  type={post.media_type} 
                  onImageClick={post.media_type === 'image' ? () => openImageViewer([post.media_url], 0) : undefined}
                />
              </Box>
            )}
            {Array.isArray(post.media_list) && post.media_list.length > 0 && (
              <SimpleGrid 
                mt={3} 
                columns={{ 
                  base: 1, 
                  sm: post.media_list.length === 1 ? 1 : 2, 
                  md: Math.min(3, post.media_list.length) 
                }} 
                spacing={2}
              >
                {(() => {
                  const imageUrls = post.media_list.filter((m) => m.type === 'image').map((m) => m.url)
                  return post.media_list.map((m) => {
                    const imageIndex = m.type === 'image' ? imageUrls.indexOf(m.url) : -1
                    return (
                      <Box key={m.id || m.url} overflow='hidden' borderRadius='md'>
                        <Media 
                          url={m.url} 
                          type={m.type} 
                          onImageClick={m.type === 'image' ? () => openImageViewer(imageUrls, Math.max(0, imageIndex)) : undefined}
                        />
                      </Box>
                    )
                  })
                })()}
              </SimpleGrid>
            )}

            {/* Counts row */}
            <Flex 
              mt={4} 
              justify='space-between' 
              color={useColorModeValue('gray.600','gray.400')} 
              fontSize={{ base: 'xs', sm: 'sm' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={2}
            >
              <HStack spacing={3} flexWrap='wrap'>
                {(post.likes || 0) > 0 && (
                  <HStack spacing={1}>
                    <FiThumbsUp size={14} />
                    <Text>{post.likes}</Text>
                  </HStack>
                )}
                {(post.loves || 0) > 0 && (
                  <HStack spacing={1}>
                    <FiHeart size={14} />
                    <Text>{post.loves}</Text>
                  </HStack>
                )}
                {(post.supports || 0) > 0 && (
                  <HStack spacing={1}>
                    <BiSupport size={14} />
                    <Text>{post.supports}</Text>
                  </HStack>
                )}
              </HStack>
              <HStack spacing={1}>
                <IoChatbubbleOutline size={14} />
                <Text>{post.comments_count || 0}</Text>
              </HStack>
            </Flex>

            {/* Action buttons */}
            <Flex 
              mt={2} 
              direction={{ base: 'column', sm: 'row' }}
              justify='space-between' 
              borderTop='1px solid' 
              borderColor={useColorModeValue('gray.200','gray.700')} 
              pt={2}
              gap={2}
            >
              <ReactionBar 
                myReaction={post.myReaction} 
                onReact={(r) => handleReact(post.id, r, 'post')} 
                isSubmitting={reactingTarget === post.id} 
              />
              <HStack spacing={1} justify={{ base: 'center', sm: 'flex-end' }}>
                <Button 
                  leftIcon={<IoChatbubbleOutline />} 
                  size={{ base: 'xs', sm: 'sm' }} 
                  variant='ghost' 
                  onClick={() => toggleComments(post.id)} 
                  _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                >
                  تعليق
                </Button>
                <Button 
                  leftIcon={<IoShareSocialOutline />} 
                  size={{ base: 'xs', sm: 'sm' }} 
                  variant='ghost' 
                  _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                >
                  مشاركة
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Flex>
      </Box>
    )
  }

  const pageBg = useColorModeValue('gray.100', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box minH='100vh' bg={pageBg} pt={{ base: '60px', md: '80px' }}>
      <Flex maxW={{ base: '100%', sm: '600px', md: '800px', lg: '900px' }} mx='auto' direction='column' px={{ base: 2, sm: 4, md: 6 }}>
        {/* Composer */}
        <Box 
          border='1px solid' 
          borderColor={borderColor} 
          borderRadius={{ base: 'xl', md: '2xl' }} 
          bg={cardBg} 
          p={{ base: 3, sm: 4, md: 5 }} 
          mb={{ base: 4, md: 6 }} 
          boxShadow={useColorModeValue('sm','dark-lg')} 
          _hover={{ borderColor: useColorModeValue('gray.300','gray.600') }} 
          transition='border-color 0.15s ease'
        >
          <Flex direction={{ base: 'column', sm: 'row' }} align='start' spacing={3}>
            <Avatar 
            className='mx-2'
              name={userData?.name} 
              size={{ base: 'sm', md: 'md' }}
              src={userData?.avatar}
            />
            <Box flex='1' w='full'>
              <Textarea 
                placeholder='اكتب منشوراً عاماً...' 
                value={composer.content} 
                onChange={(e) => setComposer(prev => ({ ...prev, content: e.target.value }))} 
                mb={3} 
                bg={useColorModeValue('gray.50','gray.700')} 
                _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }} 
                borderRadius='lg'
                minH={{ base: '80px', md: '100px' }}
                fontSize={{ base: 'sm', md: 'md' }}
                resize='vertical'
              />
              {/* Media preview */}
              {pendingMedia.length > 0 && (
                <SimpleGrid 
                  columns={{ base: 1, sm: 2, md: Math.min(3, pendingMedia.length) }} 
                  spacing={2} 
                  mb={3}
                >
                  {pendingMedia.map((pm, idx) => (
                    <Flex 
                      key={idx} 
                      align='center' 
                      border='1px solid' 
                      borderColor={borderColor} 
                      p={2} 
                      borderRadius='md' 
                      bg={useColorModeValue('gray.50','gray.700')}
                      direction={{ base: 'column', sm: 'row' }}
                      gap={2}
                    >
                      {pm.kind === 'image' ? (
                        <Image 
                          src={pm.previewUrl} 
                          alt='preview' 
                          boxSize={{ base: '80px', sm: '60px' }} 
                          objectFit='cover' 
                          borderRadius='md' 
                        />
                      ) : (
                        <Text fontSize={{ base: 'xs', sm: 'sm' }} textAlign='center'>
                          ملف: {pm.file.name.length > 20 ? pm.file.name.substring(0, 20) + '...' : pm.file.name}
                        </Text>
                      )}
                      <IconButton 
                        aria-label='إزالة' 
                        icon={<IoClose />} 
                        size='sm' 
                        variant='ghost' 
                        onClick={() => {
                          if (pm.previewUrl) URL.revokeObjectURL(pm.previewUrl)
                          setPendingMedia(prev => prev.filter((_, i) => i !== idx))
                        }} 
                      />
                    </Flex>
                  ))}
                </SimpleGrid>
              )}
              
              {/* Controls */}
              <VStack spacing={3} align='stretch'>
                {/* Action buttons */}
                <Flex 
                  direction={{ base: 'column', sm: 'row' }} 
                  justify='space-between' 
                  align={{ base: 'stretch', sm: 'center' }}
                  gap={3}
                >
                  <HStack spacing={{ base: 1, sm: 2 }} flexWrap='wrap' justify={{ base: 'center', sm: 'flex-start' }}>
                    <Button 
                      leftIcon={<IoImageOutline />} 
                      variant='ghost' 
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handlePickFile}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    >
                      <Text display={{ base: 'none', sm: 'inline' }}>صورة/ملف</Text>
                      <Text display={{ base: 'inline', sm: 'none' }}>صورة</Text>
                    </Button>
                    <Button 
                      leftIcon={<IoVideocamOutline />} 
                      variant='ghost' 
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handlePickFile}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    >
                      <Text display={{ base: 'none', sm: 'inline' }}>فيديو</Text>
                      <Text display={{ base: 'inline', sm: 'none' }}>فيديو</Text>
                    </Button>
                    <Button 
                      leftIcon={<IoHappyOutline />} 
                      variant='ghost' 
                      size={{ base: 'sm', md: 'md' }}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    >
                      <Text display={{ base: 'none', sm: 'inline' }}>شعور/نشاط</Text>
                      <Text display={{ base: 'inline', sm: 'none' }}>شعور</Text>
                    </Button>
                  </HStack>
                  
                  {/* Visibility and Publish */}
                  <HStack spacing={2} justify={{ base: 'center', sm: 'flex-end' }}>
                    <Select 
                      w={{ base: '120px', sm: '140px', md: '160px' }} 
                      value={composer.visibility} 
                      onChange={(e) => setComposer(prev => ({ ...prev, visibility: e.target.value }))} 
                      bg={useColorModeValue('gray.50','gray.700')} 
                      _focus={{ borderColor: 'teal.400' }} 
                      borderRadius='md'
                      size={{ base: 'sm', md: 'md' }}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    >
                      <option value='public'>عام</option>
                      <option value='grades'>الصفوف</option>
                      <option value='teachers'>المعلمين</option>
                      <option value='students'>الطلاب</option>
                    </Select>
                    <Button 
                      colorScheme='teal' 
                      onClick={handleCreatePost} 
                      isLoading={creating} 
                      isDisabled={!composer.content.trim() && !pendingMedia}
                      size={{ base: 'sm', md: 'md' }}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      px={{ base: 4, sm: 6 }}
                    >
                      نشر
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
              <input ref={fileInputRef} type='file' style={{ display: 'none' }} onChange={handleFileChange} multiple accept='image/*,video/*,application/pdf,application/*,text/*' />
            </Box>
          </Flex>
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
        <Modal 
          isOpen={!!activeCommentsPost} 
          onClose={() => setActiveCommentsPost(null)} 
          size={{ base: 'full', sm: 'xl', md: '2xl' }} 
          scrollBehavior='inside'
        >
          <ModalOverlay />
          <ModalContent maxH={{ base: '100vh', sm: '90vh' }} m={{ base: 0, sm: 4 }}>
            <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>التعليقات</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={0}>
              <Box>
                {/* Reply bar */}
                {replyTargetByPost[activeCommentsPost] && (
                  <Flex 
                    bg={useColorModeValue('green.50','green.900')} 
                    borderLeft='4px solid' 
                    borderColor='green.400' 
                    p={{ base: 2, sm: 3 }} 
                    borderRadius='md' 
                    mb={3} 
                    align='center'
                    direction={{ base: 'column', sm: 'row' }}
                    gap={2}
                  >
                    <Box flex='1' w='full'>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight='bold'>
                        {replyTargetByPost[activeCommentsPost]?.author_name}
                      </Text>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} noOfLines={2}>
                        {replyTargetByPost[activeCommentsPost]?.content}
                      </Text>
                    </Box>
                    <Button 
                      size={{ base: 'xs', sm: 'sm' }} 
                      variant='ghost' 
                      onClick={() => setReplyTargetByPost(prev => ({ ...prev, [activeCommentsPost]: null }))}
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    >
                      إلغاء
                    </Button>
                  </Flex>
                )}

                <VStack align='stretch' spacing={2} maxH={{ base: '50vh', sm: '60vh' }} overflowY='auto'>
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
              <Flex 
                w='full' 
                direction={{ base: 'column', sm: 'row' }}
                gap={3}
                align={{ base: 'stretch', sm: 'center' }}
              >
                <Avatar 
                  size={{ base: 'sm', sm: 'md' }} 
                  name={userData?.name}
                  src={userData?.avatar}
                />
                <Textarea 
                  placeholder='اكتب تعليقك...' 
                  flex='1' 
                  bg={useColorModeValue('gray.50','gray.700')} 
                  _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }} 
                  borderRadius='lg' 
                  resize='vertical' 
                  minH={{ base: '40px', sm: '44px' }}
                  onChange={(e) => { /* use local state */ }} 
                  id='modal-comment-input'
                  fontSize={{ base: 'sm', sm: 'md' }}
                />
                <Button 
                  colorScheme='teal' 
                  onClick={() => {
                    const input = document.getElementById('modal-comment-input')
                    const content = input?.value || ''
                    if (!content.trim()) return
                    handleAddComment(activeCommentsPost, content, replyTargetByPost[activeCommentsPost])
                    if (input) input.value = ''
                  }}
                  size={{ base: 'sm', sm: 'md' }}
                  fontSize={{ base: 'sm', sm: 'md' }}
                  px={{ base: 4, sm: 6 }}
                >
                  إرسال
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <Modal 
          isOpen={!!editPost} 
          onClose={() => setEditPost(null)}
          size={{ base: 'full', sm: 'md', md: 'lg' }}
        >
          <ModalOverlay />
          <ModalContent m={{ base: 0, sm: 4 }}>
            <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تعديل المنشور</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align='stretch' spacing={4}>
                <Textarea 
                  value={editPostDraft.content} 
                  onChange={(e) => setEditPostDraft(prev => ({ ...prev, content: e.target.value }))}
                  minH={{ base: '120px', sm: '150px' }}
                  fontSize={{ base: 'sm', sm: 'md' }}
                  resize='vertical'
                />
                <Select 
                  value={editPostDraft.visibility} 
                  onChange={(e) => setEditPostDraft(prev => ({ ...prev, visibility: e.target.value }))}
                  size={{ base: 'sm', sm: 'md' }}
                  fontSize={{ base: 'sm', sm: 'md' }}
                >
                  <option value='public'>عام</option>
                  <option value='grades'>الصفوف</option>
                  <option value='teachers'>المعلمين</option>
                  <option value='students'>الطلاب</option>
                </Select>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant='ghost' 
                mr={3} 
                onClick={() => setEditPost(null)}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme='teal' 
                onClick={async () => {
                  try {
                    const { data } = await baseUrl.put(`/api/social/posts/${editPost.id}`, { content: editPostDraft.content, visibility: editPostDraft.visibility }, { headers: authHeader ? { Authorization: authHeader } : {} })
                    const updated = data?.post || { id: editPost.id, content: editPostDraft.content, visibility: editPostDraft.visibility }
                    setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, content: updated.content, visibility: updated.visibility } : p))
                    setEditPost(null)
                  } catch {
                    toast({ title: 'تعذر تعديل المنشور', status: 'error', duration: 2500, isClosable: true })
                  }
                }}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                حفظ
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Post Confirm */}
      {deletePostId && (
        <Modal 
          isOpen={!!deletePostId} 
          onClose={() => setDeletePostId(null)}
          size={{ base: 'sm', sm: 'md' }}
        >
          <ModalOverlay />
          <ModalContent m={{ base: 4, sm: 0 }}>
            <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تأكيد الحذف</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize={{ base: 'sm', sm: 'md' }}>هل تريد حذف هذا المنشور؟</Text>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant='ghost' 
                mr={3} 
                onClick={() => setDeletePostId(null)}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme='red' 
                onClick={async () => {
                  try {
                    await baseUrl.delete(`/api/social/posts/${deletePostId}`, { headers: authHeader ? { Authorization: authHeader } : {} })
                    setPosts(prev => prev.filter(p => p.id !== deletePostId))
                    setDeletePostId(null)
                  } catch {
                    toast({ title: 'تعذر حذف المنشور', status: 'error', duration: 2500, isClosable: true })
                  }
                }}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                حذف
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Comment Modal */}
      {editComment && (
        <Modal 
          isOpen={!!editComment} 
          onClose={() => setEditComment(null)}
          size={{ base: 'full', sm: 'md', md: 'lg' }}
        >
          <ModalOverlay />
          <ModalContent m={{ base: 0, sm: 4 }}>
            <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تعديل التعليق</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea 
                value={editCommentDraft} 
                onChange={(e) => setEditCommentDraft(e.target.value)}
                minH={{ base: '100px', sm: '120px' }}
                fontSize={{ base: 'sm', sm: 'md' }}
                resize='vertical'
              />
            </ModalBody>
            <ModalFooter>
              <Button 
                variant='ghost' 
                mr={3} 
                onClick={() => setEditComment(null)}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme='teal' 
                onClick={async () => {
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
                }}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                حفظ
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Image Lightbox */}
      {imageViewer.isOpen && (
        <Modal isOpen={imageViewer.isOpen} onClose={closeImageViewer} size='4xl'>
          <ModalOverlay bg='blackAlpha.800' />
          <ModalContent bg='transparent' boxShadow='none'>
            <ModalCloseButton color='white' />
            <ModalBody p={0} display='flex' alignItems='center' justifyContent='center'>
              <Flex w='full' align='center' justify='center' position='relative'>
                <IconButton 
                  aria-label='السابق' 
                  icon={<IoChevronBack />} 
                  onClick={showPrevImage} 
                  position='absolute' 
                  left={2} 
                  top='50%'
                  transform='translateY(-50%)'
                  colorScheme='whiteAlpha'
                  variant='ghost'
                />
                <Image 
                  src={imageViewer.urls[imageViewer.index]} 
                  alt={`image-${imageViewer.index+1}`} 
                  maxH='80vh' 
                  maxW='90vw' 
                  objectFit='contain' 
                />
                <IconButton 
                  aria-label='التالي' 
                  icon={<IoChevronForward />} 
                  onClick={showNextImage} 
                  position='absolute' 
                  right={2} 
                  top='50%'
                  transform='translateY(-50%)'
                  colorScheme='whiteAlpha'
                  variant='ghost'
                />
              </Flex>
            </ModalBody>
            <ModalFooter justifyContent='space-between'>
              <Text color='white' fontSize='sm'>
                {imageViewer.index + 1} / {imageViewer.urls.length}
              </Text>
              <HStack>
                <Button leftIcon={<IoDownloadOutline />} onClick={downloadCurrentImage}>
                  حفظ الصوره
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Comment Confirm */}
      {deleteComment && (
        <Modal 
          isOpen={!!deleteComment} 
          onClose={() => setDeleteComment(null)}
          size={{ base: 'sm', sm: 'md' }}
        >
          <ModalOverlay />
          <ModalContent m={{ base: 4, sm: 0 }}>
            <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تأكيد الحذف</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize={{ base: 'sm', sm: 'md' }}>هل تريد حذف هذا التعليق؟</Text>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant='ghost' 
                mr={3} 
                onClick={() => setDeleteComment(null)}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme='red' 
                onClick={async () => {
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
                }}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
              >
                حذف
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  )
}

export default Social