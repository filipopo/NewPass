def getHeadline(username, url, id):
    if url:
        if username:
            return f'{username} {url}'
        return url
    elif username:
        return username

    return f'Secret {id}'
