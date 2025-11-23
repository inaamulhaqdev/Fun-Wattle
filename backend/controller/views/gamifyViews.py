from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *

# Gamification tests

@api_view(['GET', 'PUT'])
def coins(request, profile_id):
	try:
		profile = Profile.objects.get(id=profile_id)
	except Profile.DoesNotExist:
		return Response({'error': 'Profile not found'}, status=404)
	if request.method == 'GET':
		return Response({
			'coins':profile.coins
		}, status=200)
	if request.method == 'PUT':
		amount = request.data.get('amount')
		if amount is None:
			return Response({'error':'Amount is required'}, status=400)
		try:
			amount = int(amount)
		except ValueError:
			return Response({'error':'Amount must be an integer'}, status=400)
		if amount < 0:
			return Response({'error':'Can not add negative coins'}, status=401)
		profile.coins += amount
		profile.save()
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

	serializer = MascotItemsSerializer(inv, many=True)
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
	prev_purchase = Inventory.objects.filter(
		profile = profile.id,
		mascot_item = item
	).exists()
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
	if request.method == 'GET':
		items = equipped_items(profile.id)
		return Response(items, status=200)

	elif request.method == 'PUT':
		item_id = request.data.get('item')
		try:
			item = Mascot_Items.objects.get(id=item_id)
		except Mascot_Items.DoesNotExist:
			return Response({'error': 'Mascot Item not found'}, status=404)
		inv_item_to_equip = Inventory.objects.filter(
			profile = profile.id,
			mascot_item = item
		).first()
		if not inv_item_to_equip:
			return Response({'error':'Item has not been purchased'}, status=401)
		inv_item_to_unequip = Inventory.objects.filter(
			profile = profile.id,
			equipped = True,
			mascot_item__item_type = item.item_type,
		).first()
		if inv_item_to_unequip:
			inv_item_to_unequip.equipped = False
			inv_item_to_unequip.save()
		inv_item_to_equip.equipped = True
		inv_item_to_equip.save()
		items = equipped_items(profile.id)
		return Response(items, status=200)