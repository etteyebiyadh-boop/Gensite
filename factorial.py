def factorial(n: int) -> int:
    """Return n! (factorial of n). Raises ValueError if n < 0."""
    if n < 0:
        raise ValueError("factorial not defined for negative numbers")
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
