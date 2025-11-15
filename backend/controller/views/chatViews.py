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

    # Get chat room data based on perspective of parent or therapist
    if profile.profile_type == 'parent':
        chat_rooms = Chat_Room.objects.filter(parent=profile)
    else:
        chat_rooms = Chat_Room.objects.filter(therapist=profile)

    data = []
    for chat_room in chat_rooms:
        # Get profile name and profile picture for the recipient of each chat room
        if profile.profile_type == 'parent':
            recipient_profile = chat_room.therapist
        else:
            recipient_profile = chat_room.parent
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

# This needs more work to determine who the recipient is based on the profile type
# @api_view(['GET'])
# def get_chat_messages(request, chat_room_id):
#     chat_room = Chat_Room.objects.filter(id=chat_room_id).first()
#     if not chat_room:
#         return Response({'error': 'Chat room not found'}, status=404)

#     messages = Chat_Message.objects.filter(chat_room=chat_room).order_by('timestamp')
#     serializer = ChatMessageSerializer(messages, many=True)
#     return Response(serializer.data, status=200)
