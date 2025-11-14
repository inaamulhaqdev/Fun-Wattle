from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *

@api_view(['POST'])
def create_profile(request):
	user_id = request.data.get('user_id')
	name = request.data.get('name')
	creating_child_profile = request.data.get('creating_child_profile')
	profile_picture = request.data.get('profile_picture')
	pin_hash = request.data.get('pin_hash')
	child_details = request.data.get('child_details', None)

	if not name or not user_id or creating_child_profile is None:
		return Response({'error': 'Missing required fields: name, user_id, creating_child_profile'}, status=400)

	user = User.objects.get(id=user_id)
	if not user:
		return Response({'error': 'User not found'}, status=404)

	if creating_child_profile:
		profile_type = 'child'
	else:
		profile_type = user.user_type

	if profile_type == 'parent' and not pin_hash:
		return Response({'error': 'pin_hash is required for parent profile'}, status=400)

	# Create the profile
	profile = Profile.objects.create(
		profile_type=profile_type,
		name=name,
		profile_picture=profile_picture,
		pin_hash=pin_hash,
		child_details=child_details
	)

	# Link profile to user
	user_profile = User_Profile.objects.create(user=user, profile=profile)

	profile_serializer = ProfileSerializer(profile)
	user_profile_serializer = User_ProfileSerializer(user_profile)

	return Response({
		'profile': profile_serializer.data,
		'user_profile': user_profile_serializer.data
	}, status=201)


@api_view(['GET'])
def get_user_profiles(request, user_id):
	try:
		user = User.objects.get(id=user_id)
	except User.DoesNotExist:
		return Response({'error': 'User not found. Please complete registration first.'}, status=404)

	profile_ids = User_Profile.objects.filter(user=user).values_list('profile', flat=True)
	profiles = Profile.objects.filter(id__in=profile_ids)

	serializer = ProfileSerializer(profiles, many=True)
	return Response(serializer.data, status=200)


@api_view(['GET'])
def get_profile(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=200)


@api_view(['GET'])
def coins(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    return Response({
          'coins':profile.coins
	}, status=200)


@api_view(['GET'])
def get_streak(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    return Response({
          'streak':profile.streak
	}, status=200)


@api_view(['GET'])
def shop(request):
	shop = Mascot_Items.objects.all()
	serializer = MascotItemsSerializer(shop, many=True)
	return Response(serializer.data, status=200)
	

@api_view(['GET'])
def get_item(request, item_id):
	try:
		item = Mascot_Items.objects.get(id=item_id)
	except Mascot_Items.DoesNotExist:
		return Response({'error': 'Mascot Item not found'}, status=404)
	serializer = MascotItemsSerializer(item)
	return Response(serializer.data, status=200)

@api_view(['GET'])
def get_inv(request, profile_id):
	try:
		profile = Profile.objects.get(id=profile_id)
	except Profile.DoesNotExist:
		return Response({'error': 'Profile not found'}, status=404)
	inv = Inventory.objects.filter(
		profile = profile.id
	).select_related('mascot_item')
	
	serializer = InventorySerializer(inv, many=True)
	return Response(serializer.data, status=200)

@api_view(['POST'])
def update_inv(request, profile_id, item_id):
	try:
		profile = Profile.objects.get(id=profile_id)
		item = Mascot_Items.objects.get(id=item_id)
	except Profile.DoesNotExist:
		return Response({'error': 'Profile not found'}, status=404)
	except Mascot_Items.DoesNotExist:
		return Response({'error': 'Mascot Item not found'}, status=404)
	prev_purchase = Inventory.objects.get(
		profile = profile.id,
		mascot_item = item          
	)
	if prev_purchase:
		return Response({'error':'Item has already been purchased'}, status=400)
	if profile.coins < item.price:
		return Response({'error': 'Item is too expensive'}, status=400)
	inv_item = Inventory.objects.create(
		profile=profile,
		mascot_item=item,
		equipped=False
	)    
	profile.coins = profile.coins - item.price
	profile.save()
	if not inv_item:	
		return Response({'error':'Failed to purchase item'})
	return Response({'message':'Success'}, status=200)
		
def equipped_items(profile_id):
	qs = Inventory.objects.filter(
		profile=profile_id,
		equipped=True,
	)
	inv_qs = qs.select_related('mascot_item')

	result = {'head': None, 'torso': None}
	for inv_item in inv_qs:
		mi = inv_item.mascot_item
		if not mi:
			continue
		key = mi.item_type
		result[key] = {MascotItemsSerializer(mi).data}
	return result
        
@api_view(['GET', 'PUT'])
def mascot(request, profile_id):
	try:
		profile = Profile.objects.get(id=profile_id)
	except Profile.DoesNotExist:
		return Response({'error': 'Profile not found'}, status=404)
	eqipped_items = equipped_items(profile.id)
	if equipped_items.length > 2:
		return Response({'error':'Cannot equip more than 2 items'}, status=400)	
	if request.method == 'GET':
		items = equipped_items(profile.id)
		return Response(items, status=200)
		
	elif request.method == 'PUT':
		item_id = request.data.get('item')
		try:
			item = Mascot_Items.objects.get(id=item_id)
		except Mascot_Items.DoesNotExist:
			return Response({'error': 'Mascot Item not found'}, status=404)
		inv_item_to_equip = Inventory.objects.get(
			profile = profile.id,
			mascot_item = item          
		)
		if not inv_item_to_equip:
			return Response({'error':'Item has not been purchased'}, status=400)
		inv_item_to_unequip = Inventory.objects.get(
			profile = profile.id,
			equipped = True,
			mascot_item__item_type = item.item_type,
		)
		if inv_item_to_unequip:
			inv_item_to_unequip.equipped = False
			inv_item_to_unequip.save()
		inv_item_to_equip.equipped = True
		inv_item_to_equip.save()
		items = equipped_items(profile.id)
		return Response(items, staus=200)
