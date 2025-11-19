from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *

@api_view(['GET'])
def get_chat_rooms(request, profile_id):
    profile = Profile.objects.filter(id=profile_id).first()
    if not profile:
        return Response({'error': 'Profile not found'}, status=404)

    if profile.profile_type not in ['parent', 'therapist']:
        return Response({'error': 'Profile must be of type parent or therapist'}, status=400)

    # Get chat room data for the profile whether they are messenger_1 or messenger_2
    chat_rooms = Chat_Room.objects.filter(messenger_1=profile) | Chat_Room.objects.filter(messenger_2=profile)

    data = []
    for chat_room in chat_rooms:
        # Get profile name and profile picture for the recipient of each chat room
        if chat_room.messenger_1 == profile:
            recipient_profile = chat_room.messenger_2
        else:
            recipient_profile = chat_room.messenger_1
        name = recipient_profile.name
        profile_picture = recipient_profile.profile_picture

         # Get previous message for each chat room
        last_message = Chat_Message.objects.filter(chat_room=chat_room).order_by('-timestamp').first()
        if last_message:
            last_message_content = last_message.message_content
        else:
            last_message_content = ''

        data.append({
            'id': chat_room.id,
            'name': name,
            'profile_picture': profile_picture,
            'last_message': last_message_content,
        })

    return Response(data, status=200)


@api_view(['GET', 'POST'])
def chat_messages(request, chat_room_id):
    chat_room = Chat_Room.objects.filter(id=chat_room_id).first()
    if not chat_room:
        return Response({'error': 'Chat room not found'}, status=404)

    # Get all messages for a chat room
    if request.method == 'GET':
        messages = Chat_Message.objects.filter(chat_room=chat_room).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=200)

    # Post a new message to a chat room
    elif request.method == 'POST':
        sender_profile_id = request.data.get('sender_profile_id')
        message_content = request.data.get('message_content')

        if not sender_profile_id or not message_content:
            return Response({'error': 'Missing required fields: sender_profile_id, message_content'}, status=400)

        sender_profile = Profile.objects.filter(id=sender_profile_id).first()
        if not sender_profile:
            return Response({'error': 'Sender profile not found'}, status=404)

        chat_message = Chat_Message.objects.create(
            chat_room=chat_room,
            sender=sender_profile,
            message_content=message_content
        )

        serializer = ChatMessageSerializer(chat_message)
        return Response(serializer.data, status=201)


def create_chats(profile):
    # Create chat room between a therapist and parent
    user = User_Profile.objects.get(profile=profile).user
    children = User_Profile.objects.filter(user=user, profile__profile_type='child')
    for child in children:
        existing_chat = Chat_Room.objects.filter(
            child_profile=child.profile).first()
        if existing_chat: continue
        therapist_user = User_Profile.objects.get(user=therapist, profile__profile_type='child').first()
        therapist_profile = User_Profile.objects.get(user=therapist_user, profile__profile_type='therapist').profile

        


